import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable , of} from 'rxjs';

import { EnvironmentService } from '../../service/environment.service';
import { Logger } from '../../logger/logger';
import { map } from 'rxjs/operators';
import { AuthConfService } from './auth-conf.service';
import { AppConfService } from '../../service/app-conf.service';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationService {
  private userAuthorityList: any[];
  private tempUserAuthorityList: any[];
  private userRoleNameList: any[];
  private userAuthorityObj: any;
  xAuth: string;

  constructor(
    private http: HttpClient,
    private envService: EnvironmentService,
    private logger: Logger,
    private authConfService: AuthConfService,
    private appConfService: AppConfService
  ) {}

  getUserAuthorityList() {
    return this.userAuthorityList;
  }
  getUserRoleNameList() {
    return this.userRoleNameList;
  }
  getUserAuthorityObj() {
    return this.userAuthorityObj;
  }
  resetUserAuthorityList() {
    this.tempUserAuthorityList = this.userAuthorityList;
    this.userAuthorityList = undefined;
  }
  recoverUserAuthorityList() {
    if (this.tempUserAuthorityList) {
      this.userAuthorityList = this.tempUserAuthorityList;
    }
  }

  private getUserAuthorityUrl(): string {
    const userAuthorityUrl = this.appConfService.getValueByName('userAuthorityUrl');
    if (typeof userAuthorityUrl === 'string') {
      // for iec special User Authority URL
      return userAuthorityUrl;
    }
    const applicationId = this.envService.getApplicationId();
    return '/user/authority/query/' + applicationId;
  }

  getRemoteUserAuthority(): Observable<object> {
    const baseUrl = this.envService.getApiBaseUrl('xgfe-base-OKTA', true);
    const userAuthorityUrl = this.getUserAuthorityUrl();
    if (baseUrl && !this.authConfService.isRefreshTokenWindow() && !this.authConfService.isPopupGetNewTokenWindow()) {
      if (this.userAuthorityList) {
        return of(this.userAuthorityList);
      }
      return this.http.get(baseUrl + userAuthorityUrl)
        .pipe(map(
        (result: any) => {
          if (result && result.data) {
            this.userAuthorityObj = result.data;
            if (result.data.roleNameList) {
              this.userRoleNameList = result.data.roleNameList;
            }
            const appUserAuthorityUrl = this.appConfService.getValueByName('userAuthorityUrl');
            if (typeof appUserAuthorityUrl === 'string') {
              // for iec special User Authority data format
              return result.data;
            } else if (result.data.listModel) {
              return result.data.listModel;
            }
          }
        }
      ));
    } else {
      return of([]);
    }
  }

  setUserAuthority(userAuthorityList) {
    this.userAuthorityList = userAuthorityList;
    this.logger.debug('AuthorizationService.setUserAuthority.userAuthorityList', userAuthorityList);
  }

}
