import { Injectable, Injector, OnDestroy } from '@angular/core';
import { Subject, interval } from 'rxjs';
import { v4 as uuid } from 'uuid';

import { SessionStorageService } from '../../service/session-storage.service';
import { CryptoKeyService } from '../../crypto/crypto-key.service';
import { CryptoUtil } from '../../crypto/crypto-util';
import { Logger } from '../../logger/logger';
import { AuthConfService } from './auth-conf.service';
import { AuthorizationService } from './authorization.service';
import { ConfirmDialogService } from '../../service/confirm-dialog.service';
import { TranslateService } from '../../translate/translate.service';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

export class CipherToken {
  constructor() { }

  tokenOwner: string;
  cipherText: string;
  lastUpdateTime: number;
  expires: number;  // unit: second
  isLoggedOut?: boolean;
  isIdleTimeout?: boolean;
}

export interface AuthToken {
  token_type: string;
  access_token: string;
  refresh_token: string;
  grant_type?: string;
  scope?: string;
  expires_in?: number;
  email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService implements OnDestroy {
  readonly loggedOutByIdleTimeout = 'idleTimeout';

  private tokenOwner: string; // token owner ID of this webApp
  private tokenDataKey: string;  // key of local storage for auth token
  private refreshTokenTimer: any;
  private defaultTokenRefreshInterval: number = 55 * 60 * 1000;
  removeRefreshTipSubject: Subject<boolean> = new Subject<boolean>();
  userProfileResetSub = new Subject();
  private refreshTipEle;
  private refreshTipText: string;
  private showRefreshTipTimer;
  navigate2GetCodePageSub = new Subject();
  private silentRefreshTokenTimer;
  private refreshSrc = '';
  private refreshName = '';
  private popUpRefreshWindowFn;

  constructor(
    private authorizationService: AuthorizationService,
    private sessionStorageService: SessionStorageService, private confirmDialogService: ConfirmDialogService,
    private cryptoKeyService: CryptoKeyService,
    private logger: Logger, private translateService: TranslateService,
    private authConfig: AuthConfService,
    private injector: Injector,
  ) {
    // console.log('init AuthenticationService...........');
    window.addEventListener('message', (event) => {
      if (event.data && event.data.access_token) {
        this.authorizationService.recoverUserAuthorityList();
        this.storeAuthToken(event.data);
        this.startRefreshTokenTimer();
        this.removeRefreshTip();
        if (event.data.startParentWindowIdleTimeoutCheck) {
          this.authConfig.idleMonitorSbuject.next(true);
        }
      } else if (event.data && event.data.refreshTokenErrorStateTxt === this.authConfig.refreshStateTxt) {
        // when refresh token fail, show dialog to get new token.
        this.confirmDialogService.showDialog({
          closable: false,
          title: 'LblRefreshSessionFail',
          messageContent: 'DAT10037',
          buttons: [
            {
              buttonLabel: 'Re-Login',
              callBackFN: () => {
                this.popUpToGetNewToken();
              }
            }
          ]
        });
      }
    });
    this.removeRefreshTipSubject.subscribe(() => {
      this.removeRefreshTip();
    });
  }

  public removeRefreshTip() {
    if (this.refreshTipEle && this.refreshTipEle.remove) {
      this.refreshTipEle.remove();
      this.showRefreshTipTimer.unsubscribe();
    }
  }

  ngOnDestroy() {
    this.stopRefreshTokenTimer();
  }

  public getTokenDataKey(): string {
    return this.tokenDataKey;
  }
  public init(): void {
    this.removeExistAuthToken();
    this.getRefreshTipText();
  }

  private getRefreshTipText() {
    this.translateService.getMessages('DAT10035').subscribe(message => {
      this.refreshTipText = message;
    });
  }

  // Generate token owner ID for current web app during initialization or re-login
  private initTokenOwner() {
    this.tokenOwner = uuid();
  }

  // To initialize token storage key during initialization or re-login
  // If this webApp is opened by another one webApp, token storage key will be reset later
  private initTokenStorageKey(): void {
    this.tokenDataKey = this.authConfig.getTokenDataKeyPrefix() + this.tokenOwner.split('-')[0];
    this.logger.debug('AuthenticationService.initTokenStorageKey.tokeDataKey.init', this.tokenDataKey);
  }

  // If this webApp is opened or loaded by another one webApp, get tokenDataKey passed from another one webApp and reset this.tokenDataKey
  public setTokenStorageKey(tokenStorageKey) {
    this.tokenDataKey = tokenStorageKey;
    this.logger.debug('AuthenticationService.setTokenStorageKey.tokeDataKey.passed', this.tokenDataKey);
  }

  public getTokenStorageKey(): string {
    return this.tokenDataKey;
  }

  // In authentication guard, this function should be called to judge if there is valid auth token already or not.
  // If not exist, the webApp should navigate to login screen
  public hasValidAuthToken(): boolean {
    const authToken: AuthToken = this.getValidAuthToken();
    if (!authToken) {
      return false;
    }
    return true;
  }

  // To get valid access token
  public getValidAccessToken(): string {
    const authToken: AuthToken = this.getValidAuthToken();
    if (authToken) {
      return authToken.access_token;
    }
    return null;
  }

  protected getValidAuthToken(): AuthToken {
    const cipherToken: CipherToken = this.getStoredCipherToken(this.tokenDataKey);
    if (!cipherToken || !cipherToken.cipherText) {
      return null;
    }
    if (this.isExpired(cipherToken)) {
      return null;
    }
    const authToken: AuthToken = this.decryptAuthToken(cipherToken.cipherText);
    if (!authToken) {
      return null;
    }
    return authToken;
  }

  // Store auth token into local storage
  public storeAuthToken(authToken: AuthToken): void {
    this.removeExistAuthToken();
    this.initTokenOwner();
    this.initTokenStorageKey();
    const cipherText: string = this.encryptAuthToken(authToken);
    const cipherToken = new CipherToken();
    cipherToken.cipherText = cipherText;
    cipherToken.tokenOwner = this.tokenOwner;
    cipherToken.lastUpdateTime = (new Date()).getTime();
    if (authToken.expires_in) {
      cipherToken.expires = authToken.expires_in;
    }
    this.sessionStorageService.setItem(this.tokenDataKey, JSON.stringify(cipherToken), false);
  }

  public removeExistAuthToken() {
    const keys: string[] = this.sessionStorageService.findKeysByPrefix(this.authConfig.getTokenDataKeyPrefix());
    keys.forEach((key: string) => {
      this.sessionStorageService.removeItem(key);
    });
  }

  // Each webApp should call setInterval() with this handler to refresh auto token after initialization
  public startRefreshTokenTimer(): void {
    if (!this.authConfig.isBypassLogin()) {
      this.stopRefreshTokenTimer();
      this.refreshTokenTimer = setTimeout(this.refreshAuthTokenHandler(), this.getTokenRefreshInterval());
      this.silentRefreshTokenTimer = setTimeout(this.refreshAuthTokenHandler(true), this.getSilentRefreshTokenInterval());
      this.logger.debug('AuthenticationService.startRefreshTokenTimer.refreshTokenTimer.new');
    }
  }

  public stopRefreshTokenTimer(): void {
    this.logger.debug('AuthenticationService.stopRefreshTokenTimer.refreshTokenTimer.existing -> Stop');
    if (this.refreshTokenTimer) {
      clearTimeout(this.refreshTokenTimer);
    }
    if (this.silentRefreshTokenTimer) {
      clearTimeout(this.silentRefreshTokenTimer);
      this.removePopUpRefreshWindowFn();
    }
  }

  addPopUpRefreshWindowFn() {
    document.body.addEventListener('click', this.popUpRefreshWindowFn);
    document.body.addEventListener('keydown', this.popUpRefreshWindowFn);
  }

  removePopUpRefreshWindowFn() {
    document.body.removeEventListener('click', this.popUpRefreshWindowFn);
    document.body.removeEventListener('keydown', this.popUpRefreshWindowFn);
  }

  public logout(loggedOutBy?: string) {
    this.authConfig.idleMonitorSbuject.next(false);
    this.stopRefreshTokenTimer();
    this.userProfileResetSub.next();
    this.authorizationService.resetUserAuthorityList();

    const cipherToken: CipherToken = this.getStoredCipherToken(this.tokenDataKey);
    if (cipherToken) {
      cipherToken.cipherText = null;
      if (loggedOutBy === this.loggedOutByIdleTimeout) {
        cipherToken.isIdleTimeout = true;
      } else {
        cipherToken.isLoggedOut = true;
      }
      this.sessionStorageService.setItem(this.tokenDataKey, JSON.stringify(cipherToken), false);
      this.logger.debug('AuthenticationService.logout.clearCipherToken......done...... old tokenDataKey', this.tokenDataKey);
    }

    this.init(); // for re-login case due to logout or idle timeout
  }


  private refreshAuthTokenHandler(isSilent = false) {
    const that = this;
    return () => {
      that.logger.debug('AuthenticationService.refreshAuthTokenHandler: begin to refresh token...............................');
      // Get Encrypted data from localStorage
      const cipherToken: CipherToken = that.getStoredCipherToken(that.tokenDataKey);
      if (!cipherToken || !cipherToken.cipherText) {
        that.stopRefreshTokenTimer();
        return;
      }
      if (isSilent) {
        this.silentRefreshAuthToken(this.refreshName);
      } else {
        this.refreshAuthToken();
      }
    };
  }

  // get interval of refreshing auth token
  private getTokenRefreshInterval(): number {
    const cipherToken: CipherToken = this.getStoredCipherToken(this.tokenDataKey);
    if (cipherToken && cipherToken.lastUpdateTime && cipherToken.expires) {
      const refreshInterval: number = this.calculateRefreshInterval(cipherToken, this.authConfig.getTokenRefreshIntervalBeforeExpired());
      return refreshInterval;
    }
    return this.defaultTokenRefreshInterval;
  }

  // get interval of Silent refreshing auth token
  private getSilentRefreshTokenInterval(): number {
    const cipherToken: CipherToken = this.getStoredCipherToken(this.tokenDataKey);
    if (cipherToken && cipherToken.lastUpdateTime && cipherToken.expires) {
      const refreshInterval: number =
        this.calculateRefreshInterval(cipherToken, this.authConfig.getSilentfreshTokenReIntervalBeforeExpired());
      return refreshInterval;
    }
    return this.defaultTokenRefreshInterval;
  }

  private calculateRefreshInterval(cipherToken: CipherToken, tokenRefreshIntervalBeforeExpired: number): number {
    return (cipherToken.lastUpdateTime + (cipherToken.expires * 1000) - ((tokenRefreshIntervalBeforeExpired + 10) * 1000) - Date.now());
  }
  private silentRefreshAuthToken(name) {
    this.navigate2GetCodePageSub.next({ action: this.authConfig.sclientRefreshTokenStateTxt, name });
  }

  private refreshAuthToken() {
    this.showRefreshTip(this.refreshSrc, this.refreshName);
  }

  popUpToGetNewToken() {
    const name = JSON.stringify({ tokenDataKey: this.tokenDataKey, tokenOwner: this.tokenOwner });
    this.navigate2GetCodePageSub.next({ action: this.authConfig.popupGetNewTokenStateTxt, name });
  }

  private showRefreshTip(src, name) {
    this.refreshTipEle = document.createElement('a');
    this.refreshTipEle.onclick = () => {
      this.navigate2GetCodePageSub.next({ action: this.authConfig.popupGetNewTokenStateTxt, name });
    };
    this.refreshTipEle.className = 'refresh-tip refresh-tip-show';
    const beforeExpired = this.authConfig.getTokenRefreshIntervalBeforeExpired();
    document.body.appendChild(this.refreshTipEle);
    const fakeTokenTimeOut = this.authConfig.getOKTASetting().fakeTokenTimeOut || 0;
    this.showRefreshTipTimer = interval(1000).pipe(tap((num) => {
      if (beforeExpired - num - fakeTokenTimeOut < 0) {
        // this.removeRefreshTip();
        // this.stopRefreshTokenTimer();
        // this.authConfig.idleMonitorSbuject.next(false);
        // this.removeExistAuthToken();
        // // pop up message dialog
        // this.confirmDialogService.showDialog({
        //   closable: false,
        //   title: 'LblSessionExpired',
        //   messageContent: 'DAT10036',
        //   buttons: [
        //     {
        //       buttonLabel: 'Re-Login',
        //       callBackFN: () => {
        //         this.popUpToGetNewToken();
        //       }
        //     }
        //   ]
        // });
        const router = this.injector.get(Router);
        sessionStorage.setItem('backupBrowserUrl', location.href);
        router.navigate(['/logout'], {queryParams: {logoutBy: this.authConfig.logoutBySessionExpired}});
      }
    })).subscribe((num) => {
      const second = Math.round(beforeExpired - num - fakeTokenTimeOut);
      this.refreshTipEle.innerText = this.refreshTipText.replace('{{0}}', this.timeConverter(second));
    });
  }

  private popUpRefreshWindow() {
    this.removePopUpRefreshWindowFn();
    window.open(this.refreshSrc, this.refreshName, this.setWindowFeatures(400, 400));
  }

  private timeConverter(secondes: number): string {
    const minutes = Math.floor(secondes / 60);
    const seconds = secondes - minutes * 60;
    function str_pad_left(str, pad, length) {
      return (new Array(length + 1).join(pad) + str).slice(-length);
    }
    return str_pad_left(minutes, '0', 2) + ':' + str_pad_left(seconds, '0', 2);
  }

  private setWindowFeatures(width: number, height: number) {
    const top = window.innerHeight - height;
    const left = window.innerWidth - width;
    const windowFeatures = `width=${width},height=${height},top=${top},left=${left},
                toolbar=no, location=no, directories=no, status=no, menubar=no, fullscreen=yes, resizable=yes, titlebar=yes`;
    return windowFeatures;
  }

  // get stored cipher token from storage
  private getStoredCipherToken(key: string): CipherToken {
    const storedData: string = this.sessionStorageService.getItem(key, false);
    if (storedData) {
      const cipherToken: CipherToken = (JSON.parse(storedData) as CipherToken);
      return cipherToken;
    }
    return null;
  }

  private encryptAuthToken(authToken: AuthToken): string {
    const cipherText: string = CryptoUtil.encrypt(JSON.stringify(authToken), this.cryptoKeyService.getCryptoKey());
    return cipherText;
  }

  private decryptAuthToken(cipherText: string): AuthToken {
    const plainText: string = CryptoUtil.decrypt(cipherText, this.cryptoKeyService.getCryptoKey());
    const authToken: AuthToken = ((JSON.parse(plainText)) as AuthToken);
    return authToken;
  }

  private isExpired(cipherToken: CipherToken): boolean {
    const diff = (Date.now() - cipherToken.lastUpdateTime) / 1000; // second
    if (diff >= cipherToken.expires) {
      return true;
    }
    return false;
  }

}
