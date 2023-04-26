import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { MenuItem } from 'primeng/api';

import { AppConfService } from '../../service/app-conf.service';
import { UserService } from '../../service/user.service';
import { AuthenticationService } from '../../auth/service/authentication.service';
import { LoginService } from '../../auth/service/login.service';
import { IdleTimeoutService } from '../../service/idle-timeout.service';
import { HeaderService } from './header.service';
import { MenuService } from '../menu-bar/menu.service';
import { ConfirmDialogService } from '../../service/confirm-dialog.service';
import { AuthConfService } from '../../auth/service/auth-conf.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']

})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() title: string;
  @Input() isSearchShow: boolean;

  userId: string;
  userNameSubcription: Subscription;

  version = '0.0.1';
  menuItems: MenuItem[];
  isInEnquiryMode: boolean;
  isInEnquiryModeSubcription: Subscription;

  constructor(
    private appConfService: AppConfService,
    private userService: UserService,
    private authenticationService: AuthenticationService,
    private loginService: LoginService,
    private idleTimeoutService: IdleTimeoutService,
    private headerService: HeaderService,
    private menuService: MenuService,
    private confirmDialogService: ConfirmDialogService,
    private authConfService: AuthConfService,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.version = this.appConfService.getVersion();
    this.menuItems = [
      {
        label: 'Logout',
        command: (event: any) => {
          this.logout();
        }
      }
    ];

    this.userNameSubcription = this.userService.usernameSubject.subscribe((data: any) => {
      this.userId = data;
    });
    this.switchEnquiryMode();
  }

  switchEnquiryMode() {
    this.isInEnquiryModeSubcription = this.headerService.isInEnquiryModeSubject.subscribe((bool: boolean) => {
      this.isInEnquiryMode = bool;
    });
  }

  logout() {
    // this.idleTimeoutService.stopIdleMonitor();
    // this.authenticationService.logout();
    // this.menuService.reSetBreadCrumbData();
    // this.headerService.logOutSubject.next();
    // this.popupLogoutDialog();
    this.router.navigate(['/logout'], {queryParams: {logoutBy: this.authConfService.manualLogoutByUser}});
  }

  // private popupLogoutDialog() {
  //   this.confirmDialogService.showDialog({
  //     closable: false,
  //     title: 'LblUserLogout',
  //     messageContent: 'DAT10034',
  //     buttons: [
  //       {
  //         buttonLabel: 'Re-Login',
  //         callBackFN: () => {
  //           if (!this.authConfService.isBypassLogin()) {
  //             this.loginService.navigate2GetCodePage(this.authConfService.manualLogoutByUser);
  //           }
  //         }
  //       }
  //     ]
  //   });
  // }

  ngOnDestroy() {
    this.userNameSubcription.unsubscribe();
    this.isInEnquiryModeSubcription.unsubscribe();
  }

}
