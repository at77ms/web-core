import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ReplaySubject, of, Observable } from 'rxjs';
import { AuthConfService } from '../auth/service/auth-conf.service';
import { AuthenticationService } from '../auth/service/authentication.service';
import { EnvironmentService } from './environment.service';
import { tap } from 'rxjs/operators';
import { AppConfService } from './app-conf.service';

export interface UserProfile {
  userId: string;
  userName: string;
  remark?: any;
}
@Injectable({
  providedIn: 'root'
})
export class UserService {
  usernameSubject = new ReplaySubject<string>();
  emailSubject = new ReplaySubject<string>();
  private userProfile: UserProfile;

  constructor(
    private authConfService: AuthConfService,
    private authenticationService: AuthenticationService,
    private http: HttpClient,
    private envService: EnvironmentService,
    private appConfService: AppConfService,
  ) {
    this.resetUserProfile();
  }

  getLocalUserProfile() {
    return this.userProfile;
  }

  resetUserProfile() {
    this.authenticationService.userProfileResetSub.subscribe(() => {
      this.userProfile = undefined;
    });
  }

  private getUserProfileBaseUrl(): string {
    const baseUrl = this.envService.getApiBaseUrl('xgfe-base', true);
    if (typeof baseUrl === 'string') {
      return baseUrl;
    }
    return this.envService.getApiBaseUrl('xgfe-base-OKTA', true);
  }

  getUserProfile(): Observable<UserProfile> {
    const byPassLogin = this.authConfService.isBypassLogin();
    const baseUrl = this.getUserProfileBaseUrl();
    if (!byPassLogin && baseUrl) {
      if (this.userProfile) {
        return of(this.userProfile);
      }
      const accessToken = this.authenticationService.getValidAccessToken();
      if (accessToken) {
        const arr = accessToken.split('.');
        const email = JSON.parse(atob(arr[1])).upn;
        return this.http.get(`${baseUrl}/user/profile`)
        .pipe(tap((result: any) => {
          if (result && result.data) {
            result.data.email = email;
            this.setUserProfile(result.data);
            return result.data;
          }
        }));
      }
    } else {
      const dummyUserProfile = this.authConfService.getDummyUserProfile();
      this.setUserProfile(dummyUserProfile);
      return of(dummyUserProfile);
    }
  }

  setUserProfile(userProfile) {
    this.userProfile = userProfile;
    if (userProfile) {
      this.setUserName(userProfile);
      this.setUserEmail(userProfile);
    }
  }

  private setUserName(userProfile) {
    if (userProfile && userProfile.userId) {
      this.usernameSubject.next(userProfile.userId);
    }
  }
  private setUserEmail(userProfile) {
    if (userProfile && userProfile.userName) {
      this.emailSubject.next(userProfile.email);
    }
  }

}
