import { Injectable } from '@angular/core';
import { Subject, ReplaySubject } from 'rxjs';
import { v4 as UUID } from 'uuid';

import { AppInfo } from './app-types';
import { CryptoKey } from '../crypto/crypto-key';
import { Logger } from '../logger/logger';

@Injectable({
  providedIn: 'root'
})
export class AppContextService {
  private appInstanceId: string;
  private openedApps: AppInfo[] = new Array<AppInfo>();
  private openedSeqNo = 1;

  private appAuthKeyReplyCount = 0;
  // private appAuthKeyFlagSubject: Subject<boolean> = new Subject<boolean>();
  private appAuthKeyFlagReplaySubject: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

  constructor(private logger: Logger) {
    this.generateAppInstanceId();
  }

  isOpenedByExistingApp(): boolean {
    if (window.opener) {
      return true;
    } else {
      return false;
    }
  }

  isOpenerNotClosed(): boolean {
    if (this.isOpenedByExistingApp() && !window.opener.closed) {
      return true;
    } else {
      return false;
    }
  }

  getAppAuthKeyFlagSubject() {
    return this.appAuthKeyFlagReplaySubject;
    // if (this.isOpenedByExistingApp()) {
    //   return this.appAuthKeyFlagSubject;
    // } else {
    //   return this.appAuthKeyFlagReplaySubject;
    // }
  }

  setAppAuthKeyFlag(hasAppAuthKey) {
    this.appAuthKeyReplyCount = this.appAuthKeyReplyCount + 1;
    this.getAppAuthKeyFlagSubject().next(hasAppAuthKey);
  }

  getAppAuthKeyReplyCount(): number {
    return this.appAuthKeyReplyCount;
  }

  // for openner
  addOpenedApp(openedWin: Window) {
    this.openedApps.push(new AppInfo(openedWin));
  }

  getAuthKeyUnacknowledgedApps(): AppInfo[] {
    const appInfos = new Array<AppInfo>();
    for (let index = 0; index < this.openedApps.length; index++) {
      const appInfo = this.openedApps[index];
      if (!appInfo || !appInfo.window || appInfo.window.closed) {
        this.openedApps.splice(index, 1);
        index--;
        continue;
      }
      if (!appInfo.isAppAuthKeyAcknowledged) {
        appInfos.push(appInfo);
        continue;
      }
    }
    return appInfos;
  }

  getAppInfoByOpenedSeqNo(openedSeqNo: number): AppInfo {
    // tslint:disable-next-line: prefer-for-of
    for (let index = 0; index < this.openedApps.length; index++) {
      const appInfo = this.openedApps[index];
      if (appInfo && appInfo.window && !appInfo.window.closed && appInfo.openedSeqNo === openedSeqNo) {
        return appInfo;
      }
    }
    return null;
  }

  nextOpenedAppSeqNo(): number {
    return this.openedSeqNo++;
  }

  getAppInstanceId(): string {
    return this.appInstanceId;
  }

    // now for opened application only
    generateAppInstanceId(): string {
      this.appInstanceId = UUID();
      return this.appInstanceId;
    }

}
