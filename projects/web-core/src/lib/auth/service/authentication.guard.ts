import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild } from '@angular/router';
import { Logger } from '../../logger/logger';
import { LoginService } from './login.service';
import { AuthConfService } from './auth-conf.service';
import { AuthorizationService } from './authorization.service';
import { UserService } from '../../service/user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationGuard implements CanActivate, CanActivateChild {

  constructor(private loginService: LoginService,
              private authConfService: AuthConfService, private userService: UserService,
              private logger: Logger, private authorizationService: AuthorizationService) {
  }

  async canActivate(): Promise<boolean> {
    const loginBool = this.checkLogin();
    if (loginBool) {
      await this.retrieveUserProfileAndAuthority();
    }
    return loginBool;
  }

  async canActivateChild(): Promise<boolean> {
    const loginBool = this.checkLogin();
    if (loginBool) {
      await this.retrieveUserProfileAndAuthority();
    }
    return loginBool;
  }

  private async retrieveUserProfileAndAuthority() {
    await Promise.all([
      this.userService.getUserProfile().toPromise().then(data => {
        // this.userService.setUserProfile(data);
        return data;
      }),
      this.authorizationService.getRemoteUserAuthority().toPromise().then(data => {
        this.authorizationService.setUserAuthority(data);
        return data;
      })
    ]).then(data => this.logger.debug('setUserProfileAndAuthority data.........', data));
  }

  private checkLogin(): boolean {
    this.logger.debug('AuthenticationGuard.bypassLogin', this.authConfService.isBypassLogin());
    if (this.authConfService.isBypassLogin()) {
      return true;
    }

    if (!this.loginService.isLoggedin()) {
      this.loginService.navigate2GetCodePage();
      return false;
    }
    return true;
  }

}
