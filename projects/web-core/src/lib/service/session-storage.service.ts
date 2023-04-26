import { Injectable } from '@angular/core';
import { CryptoUtil } from '../crypto/crypto-util';
import { CryptoKeyService } from '../crypto';

@Injectable({
  providedIn: 'root'
})
export class SessionStorageService {

  constructor(private cryptoKeyService: CryptoKeyService) {}

  setItem(key: string, value: string, isEncrypt: boolean = true): void {
    if (value && isEncrypt) {
      const cryptoKey = this.cryptoKeyService.getCryptoKey();
      value = CryptoUtil.encrypt(value, cryptoKey);
    }
    window.sessionStorage.setItem(key, value);
  }

  getItem(key: string, isDecrypt: boolean = true): string {
    let value = window.sessionStorage.getItem(key);
    if (value && isDecrypt) {
      const cryptoKey = this.cryptoKeyService.getCryptoKey();
      value = CryptoUtil.decrypt(value, cryptoKey);
    }
    return value;
  }

  removeItem(key: string): void {
    window.sessionStorage.removeItem(key);
  }

  clear(): void {
    window.sessionStorage.clear();
  }

  findKeysByPrefix(prefix: string): string[] {
    const result: string[] = [];
    for (const key in sessionStorage) {
      if (key.indexOf(prefix) === 0) {
        result.push(key);
      }
    }
    return result;
  }
}
