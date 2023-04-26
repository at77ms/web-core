import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

import { CryptoKey } from './crypto-key';
import { EnvironmentService } from '../service/environment.service';

@Injectable({
  providedIn: 'root'
})
export class CryptoKeyService {
  private readonly transferKey4CryptoKey: string = 'AIAHK-Tmp-s89dfj232Gr3lkjw';
  private cryptoKey: CryptoKey;

  constructor(
    private http: HttpClient,
    private environmentService: EnvironmentService
  ) {
  }

  // At beginning of initialization of each WebApp, this function should be called to get crypto key which passed from other webApp.
  // If crypto key is gotten, use it to initialize cryptoKey of this webapp
  public initCryptoKey(): void {
    const storedCryptoKey: string = sessionStorage.getItem(this.transferKey4CryptoKey);
    if (storedCryptoKey) {
      this.cryptoKey = (JSON.parse(storedCryptoKey) as CryptoKey);
    }
  }

  // Each webApp should call this function during initialization to judge if there is cryptoKey in memory
  // If not exist, the webApp should navigate to login screen
  public hasCryptoKey(): boolean {
    if (this.cryptoKey) {
      return true;
    }
    return false;
  }

  // call backend API to get crypto key
  public requestCryptoKey(reqCryptoKeyUrl: string): Observable<CryptoKey> {
    return this.http.get<CryptoKey>(reqCryptoKeyUrl);
  }

  public setCryptoKey(cryptoKey: CryptoKey): void {
    this.cryptoKey = cryptoKey;
  }

  public getCryptoKey(): CryptoKey {
    if (!this.cryptoKey) {
      const cryObj: any = this.environmentService.getValueAsObject('aesKey');
      if (cryObj) {
        this.cryptoKey = new CryptoKey(cryObj.key, cryObj.salt, cryObj.iv);
      }
    }
    return this.cryptoKey;
  }
}
