import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import {isBackendRequest} from './url-checker';
import { Logger } from '../logger/logger';
import { AppConfService } from '../service';
import { LoaderService } from '../service/loader.service';

@Injectable({
  providedIn: 'root'
})
export class LoaderInterceptor implements HttpInterceptor {

  constructor(private logger: Logger, private loaderService: LoaderService, private appConfService: AppConfService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (isBackendRequest(req) && !req.headers.has('Dont-Show-Loading')) {
      this.showLoader();
      this.logger.debug('LoaderInterceptor -> loader shows');
      return next.handle(req).pipe(
        finalize(() => {
          this.onEnd();
          this.logger.debug('LoaderInterceptor -> loader hides');
        })
      );
    }
    if (req.headers.has('Dont-Show-Loading')) {
      req = req.clone({ headers: req.headers.delete('Dont-Show-Loading') });
    }
    return next.handle(req);
  }

  private onEnd(): void {
    setTimeout(() => {
      this.hideLoader();
    }, this.getLoaderCloseTimeOut());
  }

  private getLoaderCloseTimeOut(): number {
    const timeOut: number = this.appConfService.getValueByName('loaderCloseTimeOut');
    if (timeOut) {
      return timeOut;
    } else {
      return 300;
    }
  }

  private showLoader(): void {
    this.loaderService.show();
  }

  private hideLoader(): void {
    this.loaderService.hide();
  }
}
