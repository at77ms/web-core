import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvironmentService } from '../service';
import { Logger } from '../logger';

@Injectable({
  providedIn: 'root'
})
export class AssetInterceptor implements HttpInterceptor {

  constructor(private logger: Logger) {}

  // To alter HTTP header for asset request
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let request = req;
    if (this.isAssetRequest(req)) {
      const headers: { [name: string]: string | string[]; } = {
        'Cache-control': 'public, max-age=0'
      };

      request = req.clone({
        setHeaders: headers
      });

      this.logger.debug('AssetInterceptor.request.modified:', request);
    }

    return next.handle(request);
  }

  private isAssetRequest(request: HttpRequest<any>): boolean {
    if (request && request.url) {
      const assetBaseUrls = EnvironmentService.getInstance().getAssetBaseUrls();
      let isFromAsset = false;
      assetBaseUrls.forEach(assetBaseUrl => {
        if (assetBaseUrl && request.url.includes(assetBaseUrl)) {
          isFromAsset = true;
        }
      });
      return isFromAsset;
    }
  }

}
