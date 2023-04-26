import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { I18nService, EnvironmentService, AppConfService } from '../service';
import { Logger } from '../logger';
import { isBackendRequest, isAddXAppHeader, isAddHeader, isBaseApiEnabledEncryption, isFrontendFileResponse } from './url-checker';
import { AuthConfService } from '../auth/service/auth-conf.service';
import { AuthenticationService } from '../auth/service/authentication.service';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HeaderInterceptor implements HttpInterceptor {
  private userIpAddr = '';
  constructor(private i18nService: I18nService, private logger: Logger,
              private authConfService: AuthConfService, private appConfService: AppConfService,
              private authenticationService: AuthenticationService) {}

  // To alter the request header.
  // a. Call language service to get current language setting and assign to Accept-Language of http header
  // b. Set other header parameters: Accept, Accept-Charset & Content-Type, etc.
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let request = req;
    if (isBackendRequest(req)) {
      const headers: { [name: string]: string | string[]; } = {
        Accept: 'application/json',
        'Accept-Language': this.i18nService.getLanguage(),
        'Content-Type': 'application/json;charset=UTF-8',
        'Cache-control': 'no-cache',
      };

      // set the AppID into the request header,
      // if don't want to add the 'X-App' header, set the 'addXAppHeader' to false which in the config file ApiBaseUrls
      if (isAddXAppHeader(req)) {
        // first find it in the application assets app-conf.json;
        // if not found, find it in the application environment.ts.
        headers['X-App'] = this.appConfService.getApplicationId() || EnvironmentService.getInstance().getApplicationId() || '';
      }
      this.addXSourceApp(req, headers);
      this.addXAuth(req, headers);
      this.addXAiaOriginatingUserId(req, headers);
      this.addXForwardedFor(req, headers);

      // disable backend crypto
      if (!this.isEnabledEnd2EndEncryption(req)) {
        headers.encodeMethod = 'null';
      }

      // bypass API gateway, that's, access backend service directly
      let dummyUserId = '';
      if (this.authConfService.getDummyUserProfile()) {
        dummyUserId = this.authConfService.getDummyUserProfile().userId;
      }
      const isBypassLogin = this.authConfService.isBypassLogin();
      if (isBypassLogin || (!isBypassLogin && dummyUserId !==  'xxxxxxx')) {
        headers.resource_owner_id = dummyUserId;
      }

      request = req.clone({
        setHeaders: headers
      });

      this.logger.debug('HeaderInterceptor.request.modified:', request);
    }

    return next.handle(request).pipe(
      tap(
        // Succeeds when there is a response; ignore other events
        event => {
          this.getXForwardedFor(event);
        }
      )
    );
  }

  private getXForwardedFor(event) {
    const response = event as HttpResponse<any>;
    // will get IP address from the first frontend request file
    if (response && isFrontendFileResponse(response) && !this.userIpAddr) {
      this.userIpAddr = response.headers.get('x-forwarded-for') || '127.0.0.1'
    }
  }

  private addXForwardedFor(req, headers) {
    if(isAddHeader(req, 'addXForwardedFor') && this.userIpAddr) {
      headers['x-forwarded-for'] = this.userIpAddr;
    }
  }

  private addXSourceApp(req, headers) {
    if (isAddHeader(req, 'addXSourceApp')) {
      headers['x-source-app'] = this.appConfService.getApplicationId() || EnvironmentService.getInstance().getApplicationId() || '';
    }
  }
  private addXAuth(req, headers) {
    if (isAddHeader(req, 'addXAuth')) {
      headers['x-auth'] = this.authenticationService.getValidAccessToken();
    }
  }
  private addXAiaOriginatingUserId(req, headers) {
    if (isAddHeader(req, 'addXAiaOriginatingUserId')) {
      const token = this.authenticationService.getValidAccessToken();
      if(token) {
        const arr = token.split('.');
        headers['x-aia-originating-user-id'] = JSON.parse(atob(arr[1])).LanID;
      }
    }

  }

  // Support the base API level end 2 end encryption control
  // if the base url don't have the encryption setting, use the application level control
  isEnabledEnd2EndEncryption(req: HttpRequest<any>): boolean {
    const BaseApiEnabledEncryption = isBaseApiEnabledEncryption(req);
    if (BaseApiEnabledEncryption !== null) {
      return BaseApiEnabledEncryption;
    } else {
      if (EnvironmentService.getInstance().isEnd2EndEncryptionEnabled()) {
        return true;
      } else {
        return false;
      }
    }
  }

}
