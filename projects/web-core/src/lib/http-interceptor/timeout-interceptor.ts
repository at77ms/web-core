import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';

import { Logger } from '../logger/logger';
import {isBackendRequest} from './url-checker';
import { AppConfService } from '../service/app-conf.service';

@Injectable({
  providedIn: 'root'
})
export class TimeoutInterceptor implements HttpInterceptor {
  private readonly defaultRequestTimeout: number = 2 * 60 * 1000;  // millisecond

  constructor(private appConfService: AppConfService, private logger: Logger) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (isBackendRequest(req)) {
      this.logger.debug('TimeoutInterceptor...');
      let requestTimeout: number = this.appConfService.getRequestTimeout();
      if (requestTimeout) {
        requestTimeout *= 1000;
      } else {
        requestTimeout = this.defaultRequestTimeout;
      }
      return next.handle(req).pipe(
        timeout(requestTimeout)
      );
    } else {
      return next.handle(req);
    }
  }

}
