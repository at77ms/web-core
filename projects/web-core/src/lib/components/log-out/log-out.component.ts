import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthConfService } from '../../auth/service/auth-conf.service';
import { AuthenticationService } from '../../auth/service/authentication.service';
import { LoginService } from '../../auth/service/login.service';
import { ConfirmDialogService } from '../../service/confirm-dialog.service';
import { IdleTimeoutService } from '../../service/idle-timeout.service';
import { HeaderService } from '../header/header.service';
import { MenuService } from '../menu-bar/menu.service';

@Component({
  selector: 'app-log-out',
  templateUrl: './log-out.component.html',
  styleUrls: ['./log-out.component.css']
})
export class LogOutComponent implements OnInit {
  display = true;
  messageContent = '';
  constructor(private authService: AuthenticationService,
              private route: ActivatedRoute,
              private idleTimeoutService: IdleTimeoutService,
              private authConfService: AuthConfService,
              private confirmDialogService: ConfirmDialogService,
              private headerService: HeaderService,
              private menuService: MenuService,
              private loginService: LoginService,
  ) {
    this.confirmDialogService.closeDialog();
  }

  ngOnInit() {
    const logoutBy = this.route.snapshot.queryParams.logoutBy;
    this.logout(logoutBy);
  }

  logout(logoutBy) {
    if (logoutBy === this.authService.loggedOutByIdleTimeout) {
      // idle timeout
      this.logoutByIdleTimeOut();
    } else if (logoutBy === this.authConfService.manualLogoutByUser) {
      // logout by user
      this.logoutByUser();
    } else {
      // token expired
      this.logoutByTokenExpired();
    }
  }

  private logoutByIdleTimeOut() {
    this.idleTimeoutService.stopIdleMonitor();
    this.menuService.reSetBreadCrumbData();
    this.headerService.logOutSubject.next();
    this.authService.logout(this.authService.loggedOutByIdleTimeout);
    this.authService.removeRefreshTipSubject.next();
    // pop up message dialog
    this.confirmDialogService.showDialog({
      closable: false,
      title: 'LblIdleTimeout',
      messageContent: 'MSG10001',
      messageContentParams: { 0: this.idleTimeoutService.idleTimeout / 1000 / 60 },
      buttons: [
        {
          buttonLabel: 'Re-Login',
          callBackFN: () => {
            if (!this.authConfService.isBypassLogin()) {
              // this.authService.popUpToGetNewToken();
              this.loginService.navigate2GetCodePage();
            }
          }
        }
      ]
    });
  }

  private logoutByUser() {
    this.idleTimeoutService.stopIdleMonitor();
    this.authService.logout();
    this.menuService.reSetBreadCrumbData();
    this.headerService.logOutSubject.next();
    this.confirmDialogService.showDialog({
      closable: false,
      title: 'LblUserLogout',
      messageContent: 'DAT10034',
      buttons: [
        {
          buttonLabel: 'Re-Login',
          callBackFN: () => {
            if (!this.authConfService.isBypassLogin()) {
              this.loginService.navigate2GetCodePage(true);
            }
          }
        }
      ]
    });
  }

  private logoutByTokenExpired() {
    this.idleTimeoutService.stopIdleMonitor();
    this.menuService.reSetBreadCrumbData();
    this.headerService.logOutSubject.next();
    this.authService.removeRefreshTip();
    this.authService.stopRefreshTokenTimer();
    this.authConfService.idleMonitorSbuject.next(false);
    this.authService.removeExistAuthToken();
    // pop up message dialog
    this.confirmDialogService.showDialog({
      closable: false,
      title: 'LblSessionExpired',
      messageContent: 'DAT10036',
      buttons: [
        {
          buttonLabel: 'Re-Login',
          callBackFN: () => {
            // this.authService.popUpToGetNewToken();
            this.loginService.navigate2GetCodePage();
          }
        }
      ]
    });
  }
}
