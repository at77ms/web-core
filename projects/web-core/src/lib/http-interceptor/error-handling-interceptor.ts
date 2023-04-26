import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { AppErrorHandler } from '../error-handler';
import { TransactionService } from '../service';
import { Logger } from '../logger';
import {isBackendRequest} from './url-checker';
import { AppConfService } from '../service/app-conf.service';
import { AuthenticationService } from '../auth/service/authentication.service';
import { CryptoUtil } from '../crypto/crypto-util';
import { CryptoKeyService } from '../crypto/crypto-key.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingInterceptor implements HttpInterceptor {
  // private userSessionID = this.generateRandomID(5);
  private userSessionID = '';
  constructor(private transactionService: TransactionService, private appErrorHandler: AppErrorHandler, private logger: Logger,
              private appConfService: AppConfService, private authenticationService: AuthenticationService,
              private cryptoKeyService: CryptoKeyService) {}

  private generateRandomID(length) {
    const result = [];
    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
    }
    return result.join('');
  }

  private genUserSessionID() {
    const token = this.authenticationService.getValidAccessToken();
    const arr = token.split('.');
    const LanID = JSON.parse(atob(arr[1])).LanID;
    let dateStr = (new Date()).toISOString().slice(0,10);
    dateStr = dateStr.replace(/-/gi, '');
    const cryptoKey = this.cryptoKeyService.getCryptoKey();
    return CryptoUtil.encrypt(`${LanID}${dateStr}`, cryptoKey).slice(0,5);
  }

  // To handling backend error
  // a. generate and set transaction ID
  // b. call error handler
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const transactionId: string = this.transactionService.genTransactionId();
    const contextId: string = this.generateRandomID(5);
    const traceId: string = this.userSessionID + contextId;
    // this.logger.debug('ErrorHandlingInterceptor -> Transaction ID: ', transactionId);

    let errorHandlingReq = req;
    if (isBackendRequest(req)) {
      if (!this.userSessionID) {
        this.userSessionID = this.genUserSessionID();
      }
      
      errorHandlingReq = req.clone({
        setHeaders: {
          transactionId,
          'x-aiahk-trace-id': this.userSessionID + contextId,
          'x-aiahk-context-id': contextId,
        }
      });

      this.logger.debug('ErrorHandlingInterceptor.errorHandlingReq:', errorHandlingReq);
    }
    // const unSubscribe$: Subject<void> = new Subject();
    // let i = 0;
    return next.handle(errorHandlingReq).pipe(
      tap(
        event => {
          // const response = event as HttpResponse<any>;
          // if (req.url.includes('dropdown/query') && i) {
          //   console.log(response);
          //   unSubscribe$.next();
          //   unSubscribe$.complete();
          // } else {
          //   i++;
          // }
        },
        error => {
          this.logger.debug('ErrorHandlingInterceptor -> error: ', error, 'Transaction ID: ', transactionId, 'Trace ID: ', this.userSessionID + contextId);
          const isEfkStandard = this.appConfService.getValueByName('isEfkStandard');
          this.handlerError(error, isEfkStandard ? this.userSessionID + contextId : transactionId);
        }
      )
    );
    // .pipe(takeUntil(unSubscribe$));
  }

  private handlerError(error: any, transactionId: string) {
    this.appErrorHandler.handleBackendError(error, transactionId);
  }

}
