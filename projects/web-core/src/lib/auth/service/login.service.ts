import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from './authentication.service';
import { CryptoKeyService } from '../../crypto/crypto-key.service';
import { AuthConfService, StateObj } from './auth-conf.service';
import { ProofKey } from '../../service/environment.service';
import { encode as base64encode } from 'base64-arraybuffer';
import { AuthorizationService } from './authorization.service';
import { NotificationService } from '../../error-handler/notification.service';
export interface OKTAToken {
  token_type: string;
  expires_in: number;
  access_token: string;
  scope: string;
  refresh_token: string;
  id_token: string;
  email: string;
  startParentWindowIdleTimeoutCheck?: boolean;
}
@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private static instance: LoginService = null;
  constructor(private router: Router,
              private authService: AuthenticationService,
              private cryptoKeyService: CryptoKeyService,
              private authConfService: AuthConfService,
              private authorizationService: AuthorizationService,
              private notificationService: NotificationService) {
      LoginService.instance = this;
      this.authService.navigate2GetCodePageSub.subscribe((action: string|undefined) => {
        this.navigate2GetCodePage(action);
      });
  }

  static getInstance(): LoginService {
    return LoginService.instance;
  }

  private async genProofKey() {
    // tslint:disable: variable-name
    const code_verifier = this.genID(64);
    const code_challenge = await this.generateCodeChallenge(code_verifier);
    return {code_verifier, code_challenge};
  }

  private async generateCodeChallenge(codeVerifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    const base64Digest = base64encode(digest);
    return base64Digest
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  private genID(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  public isLoggedin() {
    if (this.authService.hasValidAuthToken() && this.cryptoKeyService.hasCryptoKey()) {
      return true;
    } else {
      return false;
    }
  }

  public async navigate2GetCodePage(obj?: any) {
    const bool = this.backupRoutingAndName();
    if (bool) {
      let proofKey: ProofKey;
      proofKey = await this.genProofKey();
      const OKTASetting = this.authConfService.getOKTASetting();
      const stateObj: StateObj|any = {};
      stateObj.state = OKTASetting.state;
      stateObj.code_verifier = proofKey.code_verifier;
      if (obj && obj.action) {
        stateObj.action = obj.action;
      }
      const requestUrl = `${OKTASetting.OKTABaseUrl}authorize?` +
                         `client_id=${OKTASetting.client_id}&` +
                         `response_type=${OKTASetting.response_type}&` +
                         `scope=${OKTASetting.scope}&` +
                         `redirect_uri=${OKTASetting.redirect_uri}&` +
                         `state=${btoa(JSON.stringify(stateObj))}&` +
                         `code_challenge_method=S256&` +
                         `code_challenge=${proofKey.code_challenge}`;
      // tslint:disable-next-line:max-line-length
      if (obj && (obj.action === this.authConfService.popupGetNewTokenStateTxt || obj.action === this.authConfService.sclientRefreshTokenStateTxt)) {
        const windowFeatures = this.setWindowFeatures(600, 600);
        window.open(requestUrl, obj.name, windowFeatures);
      } else {
        window.location.href = requestUrl;
      }
    }
  }

  private setWindowFeatures(width: number, height: number) {
    const top = window.innerHeight - height;
    const left = window.innerWidth - width;
    const windowFeatures = `width=${width},height=${height},top=${top},left=${left},
                toolbar=no, location=no, directories=no, status=no, menubar=no, fullscreen=yes, resizable=yes, titlebar=yes`;
    return windowFeatures;
  }

  private backupRoutingAndName(): boolean {
    const url = this.getBackupUrl();
    const path = this.getUrlPath(url);
    let queryParams: any = {};
    if (url.indexOf('?') !== -1) {
      queryParams = this.getUrlParams(url.split('?')[1]);
    }
    if (queryParams.error === 'access_denied') {
      this.notificationService.add({
        severity: 'error',
        summary: `Access Denied`,
        detail: 'OKTA Access-Denied!',
        life: 6000000
      });
      return false;
    } else {
      const obj = {
        name: window.name,
        path: path === 'logout' ? '' : path,
        queryParams: path === 'logout' ? '' : queryParams,
      };
      window.name = JSON.stringify(obj);
      return true;
    }
  }

  private getBackupUrl() {
    const url = sessionStorage.getItem('backupBrowserUrl');
    if (url) {
      return url;
    }
    return location.href;
  }

  private getUrlPath(url) {
    if (url.indexOf('/#/') !== -1) {
      return url.split('/#/')[1].split('?')[0];
    }
    return '';
  }

  private getUrlParams(search): any {
    const hashes = search.slice(search.indexOf('?') + 1).split('&');
    const params = {};
    hashes.map(hash => {
      const [key, val] = hash.split('=');
      params[key] = decodeURIComponent(val);
    });
    return params;
  }

  // check if the page is redirected back from the Azure AD
  public checkIfRedirectedBack() {
    const code = this.authConfService.getParameterByName('code', location.href);
    const state = this.authConfService.getParameterByName('state', location.href);
    if (code && state) {
      const stateObj = this.authConfService.parseStateObj(state);
      if (stateObj.state.includes(this.authConfService.getOKTASetting().state)) {
        this.getToken(code, stateObj);
      }
    }
  }

  private getToken(code: string, stateObj) {
    const oktaSetting = this.authConfService.getOKTASetting();
    const url = oktaSetting.OKTABaseUrl + 'token';
    let requestData;
    requestData = {
      grant_type: oktaSetting.grant_type,
      redirect_uri: oktaSetting.redirect_uri,
      client_id: oktaSetting.client_id,
      code,
      scope: oktaSetting.scope,
      code_verifier: stateObj.code_verifier,
    };
    const formBody = [];
    // tslint:disable-next-line: forin
    for (const property in requestData) {
      const encodedKey = encodeURIComponent(property);
      const encodedValue = encodeURIComponent(requestData[property]);
      formBody.push(encodedKey + '=' + encodedValue);
    }
    const body = formBody.join('&');

    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, false);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.setRequestHeader('cache-control', 'no-cache');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        this.handelToken(JSON.parse(xhr.response));
      }
    };
    xhr.send(body);
  }

  private handelToken(obj: OKTAToken) {
    this.authorizationService.xAuth = obj.access_token;
    if (obj.access_token) {
      sessionStorage.removeItem('backupBrowserUrl');
    }
    const email = this.getEmail(obj);
    obj.email = email;
    if (this.authConfService.isRefreshTokenWindow() || this.authConfService.isPopupGetNewTokenWindow()
      || this.authConfService.isSclientRefreshTokenWindow()) {
      if (this.authConfService.isPopupGetNewTokenWindow()) {
        obj.startParentWindowIdleTimeoutCheck = true;
      }
      this.postMessageToParentWindow(obj);
    } else {
      // the page when application first open
      this.authService.storeAuthToken(obj);
      this.authService.startRefreshTokenTimer();
      if (!this.isLogoutByUser()) {
        this.resetRouteAndName();
      } else {
        this.router.navigate([''], {replaceUrl: true});
      }
    }
  }

  private isLogoutByUser(): boolean {
    const state = this.authConfService.getParameterByName('state', location.href);
    if (state) {
      const stateObj = this.authConfService.parseStateObj(state);
      return stateObj.action === this.authConfService.manualLogoutByUser;
    }
    return false;
  }

  private resetRouteAndName() {
    if (window.name) {
      try {
        const obj = JSON.parse(window.name);
        if ((obj.name === '' || obj.name) && (obj.path === '' || obj.path)) {
          window.name = obj.name;
          const queryParamsObject = obj.queryParams;
          if (this.objectSize(queryParamsObject)) {
            this.router.navigate(['/' + obj.path], {queryParams: obj.queryParams, replaceUrl: true});
          } else {
            this.router.navigate(['/' + obj.path], {replaceUrl: true});
          }
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  private objectSize(obj) {
    let size = 0;
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
          size++;
        }
    }
    return size;
  }

  private getEmail(obj) {
    const accessToken = obj.access_token;
    const arr = accessToken.split('.');
    const email = JSON.parse(atob(arr[1])).upn;
    return email;
  }

  private postMessageToParentWindow(obj: any) {
    window.opener.postMessage(obj, window.opener.origin);
    setTimeout(() => {
      window.close();
    }, 100);
  }
}
