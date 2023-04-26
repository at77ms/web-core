import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../auth/service/authentication.service';
import { isBackendRequest } from './url-checker';
import { Logger } from '../logger';

@Injectable({
  providedIn: 'root'
})
export class SecurityInterceptor implements HttpInterceptor {

  constructor(
    private auth: AuthenticationService,
    private logger: Logger) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let request: HttpRequest<any> = req;
    if (isBackendRequest(request) && !request.headers.has('Authorization')) {
      const accessToken = this.auth.getValidAccessToken();
      this.logger.debug('SecurityInterceptor.intercept.accessToken', accessToken);
      if (accessToken) {
        this.logger.debug('SecurityInterceptor -> set Authorization header parameters');

        request = request.clone({
          setHeaders: {
            Authorization: 'Bearer ' + accessToken,
          }
        });
      } else {

      }
    }
    return next.handle(request);
  }
}
