import { Injectable } from '@angular/core';
import { EventManager } from '@angular/platform-browser';
import { Subject, Subscription, Observable, timer } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { AppConfService } from './app-conf.service';
import { AuthenticationService } from '../auth/service/authentication.service';
import { ConfirmDialogService } from './confirm-dialog.service';
import { Logger } from '../logger/logger';
import { AuthConfService } from '../auth/service/auth-conf.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class IdleTimeoutService {
  private static instance: IdleTimeoutService = null;

  private lastActionTime: number;

  private timer: Observable<number>;
  private timerSubscription: Subscription;
  private timerCheckIdlePrompt: Subscription;

  private callbackFunctionList4RemoveEventHandler: Array<any> = [];
  private userActionSubject = new Subject<boolean>();
  private userActionSubscription = new Subscription();

  public idleTimeout: number;
  private idleCheckingInterval: number;
  private userActionDebounceTime4IdleChecking: number;

  constructor(
    private eventManager: EventManager,
    private appConfService: AppConfService,
    private authService: AuthenticationService,
    private confirmDialogService: ConfirmDialogService,
    private logger: Logger,
    private authConfService: AuthConfService,
    private router: Router,
  ) {
      IdleTimeoutService.instance = this;
      this.idleTimeout = (this.appConfService.getValueAsNumber('idleTimeout') || 2400) * 1000;
      this.idleCheckingInterval = (this.appConfService.getValueAsNumber('idleCheckingInterval') || 30) * 1000;
      this.userActionDebounceTime4IdleChecking = (this.appConfService.getValueAsNumber('userActionDebounceTime4IdleChecking') || 1) * 1000;
      this.authConfService.idleMonitorSbuject.subscribe((bool) => {
        if (bool) {
          this.startIdleMonitor();
        } else {
          this.stopIdleMonitor();
        }
      });
  }

  static getInstance(): IdleTimeoutService {
    return IdleTimeoutService.instance;
  }

  public startIdleMonitor() {
    this.resetLastActionTime();
    this.userActionSubscription = this.userActionSubject.pipe(debounceTime(this.userActionDebounceTime4IdleChecking)).subscribe(
      data => this.resetLastActionTime()
    );
    this.addGlobalListener();
    this.startIdleCheckTimer();
  }

  public stopIdleMonitor() {
    this.stopIdleCheckTimer();
    if (this.userActionSubscription && !this.userActionSubscription.closed) {
      this.userActionSubscription.unsubscribe();
    }
    this.stopGlobalListener();
  }

  protected resetLastActionTime() {
    // this.logger.debug('IdleTimeoutService.resetLastActionTime: user action');
    this.lastActionTime = (new Date()).getTime();
  }

  protected startIdleCheckTimer() {
    this.logger.debug('IdleTimeoutService.startTimer.begin');
    this.stopIdleCheckTimer();

    this.timer = timer(this.idleCheckingInterval, this.idleCheckingInterval);
    this.timerSubscription = this.timer.subscribe(n => {
        this.checkIdle(n);
    });
    this.timerCheckIdlePrompt = this.timer.pipe(debounceTime(this.userActionDebounceTime4IdleChecking)).subscribe((n) => {
      // this.checkIdlePrompt();
    });
    this.logger.debug('IdleTimeoutService.startTimer.end');
  }

  protected stopIdleCheckTimer() {
    if (this.timerSubscription && !this.timerSubscription.closed) {
        this.timerSubscription.unsubscribe();
        this.logger.debug('IdleTimeoutService.stopIdleCheckTimer.....................done');
    }
  }

  protected checkIdle(n) {
    // this.logger.debug('IdleTimeoutService.checkIdle.n', n);
    const currentTime = (new Date()).getTime();
    const diff = currentTime - this.lastActionTime;
    if (diff >= this.idleTimeout) {
      sessionStorage.setItem('backupBrowserUrl', location.href);
      this.router.navigate(['/logout'], {queryParams: {logoutBy: this.authService.loggedOutByIdleTimeout}});
      // this.stopIdleMonitor();
      // this.authService.logout(this.authService.loggedOutByIdleTimeout);
      // this.authService.removeRefreshTipSubject.next();
      // // pop up message dialog
      // this.confirmDialogService.showDialog({
      //   closable: false,
      //   title: 'LblIdleTimeout',
      //   messageContent: 'MSG10001',
      //   messageContentParams: {0: this.idleTimeout / 1000 / 60},
      //   buttons: [
      //     {
      //       buttonLabel: 'Re-Login',
      //       callBackFN: () => {
      //         if (!this.authConfService.isBypassLogin()) {
      //           this.authService.popUpToGetNewToken();
      //         }
      //       }
      //     }
      //   ]
      // });
    }
  }

  checkIdlePrompt() {
    const currentTime = (new Date()).getTime();
    const diff = currentTime - this.lastActionTime;
    const promptBeforeIdle = this.authConfService.getPromptBeforeIdle();
    if ((diff + promptBeforeIdle * 1000) >= this.idleTimeout) {
      console.log(diff);
      this.confirmDialogService.showDialog({
        closable: false,
        title: 'LblIdleTimeout',
        messageContent: 'MSG10001',
        messageContentParams: { 0: this.idleTimeout / 1000 / 60 },
        buttons: [
          {
            buttonLabel: 'Re-Login',
            callBackFN: () => { }
          }
        ]
      });
    }
  }

  protected addGlobalListener() {
    this.addListener('document', 'keydown');
    this.addListener('window', 'click');
  }

  protected addListener(target: string, eventName: string) {
    this.logger.debug('IdleTimeoutService.addListener:', target, eventName);
    const callbackFunc = this.eventManager.addGlobalEventListener(target, eventName, (event) => {
      // this.logger.debug('IdleTimeoutService.userAction:', target, eventName);
      this.userActionSubject.next(true);
    });

    this.addCallbackFunction4RemoveEventHandler(callbackFunc);
  }

  protected addCallbackFunction4RemoveEventHandler(callbackFunc) {
    this.callbackFunctionList4RemoveEventHandler.push(callbackFunc);
  }

  protected stopGlobalListener() {
    for (const callbackFunc of this.callbackFunctionList4RemoveEventHandler) {
      callbackFunc();
    }
    this.callbackFunctionList4RemoveEventHandler = [];
    this.logger.debug('IdleTimeoutService.stopGlobalListener.....................done');
  }

}
