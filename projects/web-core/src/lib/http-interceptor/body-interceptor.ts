import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { CryptoKeyService } from '../crypto/crypto-key.service';
import { CryptoUtil } from '../crypto/crypto-util';
import {isBackendRequest, isBackendResponse} from './url-checker';
import { Logger } from '../logger/logger';
import { EnvironmentService } from '../service';

@Injectable({
  providedIn: 'root'
})
export class BodyInterceptor implements HttpInterceptor {

  constructor(private cryptoKeyService: CryptoKeyService, private logger: Logger) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!isBackendRequest(req) || !EnvironmentService.getInstance().isEnd2EndEncryptionEnabled()) {
      return next.handle(req);
    }

    // if request.body is not null, encrypt request.body
    this.logger.debug('BodyInterceptor.request.body.original', req.body);
    let request = req;
    if (req && req.body) {
      const decryptedBody = this.encrypt(req.body);
      this.logger.debug('BodyInterceptor.request.body.decrypted', decryptedBody);
      request = req.clone({ body: decryptedBody });
    }
    this.logger.debug('BodyInterceptor.request.handled', request);

    // Decrypt response.body.data if response.body.data is not null
    return next.handle(request).pipe(
      tap(
        // Succeeds when there is a response; ignore other events
        event => {
          const response = event as HttpResponse<any>;
          this.logger.debug('BodyInterceptor.response', response);
          if (response && isBackendResponse(response) && response.body && response.body.data) {
            this.logger.debug('BodyInterceptor.response.body.data.original', response.body.data);
            const decryptedData = this.decrypt(response.body.data);
            this.logger.debug('BodyInterceptor.response.body.data.decrypted', decryptedData);
            let responseBodyData = null;
            try {
              responseBodyData = JSON.parse(decryptedData);
            } catch {
              // ignore error and return decrypted data directly
              this.logger.debug('Failed to convert decrypted data to object');
              responseBodyData = decryptedData;
            }
            response.body.data = responseBodyData;
            this.logger.debug('BodyInterceptor.response.decrypted', response);
          }
        }
      )
    );
  }

  encrypt<T>(body: T) {
    if (body) {
      let toBeEncrypted: any = body;
      if (typeof body === 'object') {
        toBeEncrypted = JSON.stringify(body);
      }
      const encryptedBody = CryptoUtil.encrypt(toBeEncrypted, this.cryptoKeyService.getCryptoKey());
      return encryptedBody;
    }
    return body;
  }

  decrypt<T>(body: T) {
    if (body) {
      const decryptedBody = CryptoUtil.decrypt(body, this.cryptoKeyService.getCryptoKey());
      return decryptedBody;
    }
    return body;
  }
}
