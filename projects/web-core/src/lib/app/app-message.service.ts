import { Injectable } from '@angular/core';
import { Subject, Observable, ReplaySubject } from 'rxjs';
import { v4 as UUID } from 'uuid';

import { AppInfo, AppAuthKey } from './app-types';
import { CryptoKey } from '../crypto/crypto-key';
import { AppContextService } from './app-context.service';
import { AuthenticationService } from '../auth/service/authentication.service';
import { CryptoKeyService } from '../crypto/crypto-key.service';
import { Logger } from '../logger/logger';

@Injectable({
  providedIn: 'root'
})
export class AppMessageService {

  constructor(
    private appContextService: AppContextService,
    private authService: AuthenticationService,
    private cryptoKeyService: CryptoKeyService,
    private logger: Logger
  ) {
  }

  requestAppAuthKey() {
    this.logger.debug('AppMessageService.requestAppAuthKey......');
    // send message to opener to request auth keys
    if (this.appContextService.isOpenerNotClosed()) {
      window.opener.postMessage({
        messageType: 'requestAppAuthKey',
        fromAppInstanceId: this.appContextService.getAppInstanceId(),
      }, window.opener.origin);
      this.logger.debug('AppMessageService -> Sent message to opener to requested app auth keys!!!');
      // for the case that page is refreshed or url is changed by user.
      // for opened page, user cannot change address now
      // TODO: Refresh function of browser will be disabled later
      setTimeout(() => {
        if (this.appContextService.getAppAuthKeyReplyCount() === 0) {
          this.appContextService.setAppAuthKeyFlag(false);
        }
      }, 2000);
    } else {
      // for the cases:
      // 1.application is opened by existing application.
      // 2.application is opened by existing applicaiton, but existing application is closed
      this.appContextService.setAppAuthKeyFlag(false);
    }
  }

  handleAppMessage(message) {
    if (! message || !message.data || !message.data.messageType) {
      return;
    }

    this.logger.debug('AppMessageService.handleAppMessage.applicationMessageType:', message.data.messageType);

    // Message Type: requestAppAuthKey
    if (message.data.messageType === 'requestAppAuthKey') {
      this.handledRequestAppAuthKeyMessage(message);
      return;
    }

    // Message Type: acknowledgeAppAuthKey
    if (message.data.messageType === 'acknowledgeAppAuthKey') {
      this.handleAcknowledgeAppAuthKeyMessage(message);
      return;
    }

    // for opened
    if (message.data.targetAppInstanceId !== this.appContextService.getAppInstanceId()) {
      return;
    }

    // Message Type: replyAppAuthKey
    if (message.data.messageType === 'replyAppAuthKey') {
      this.handleReplyAppAuthKeyMessage(message);
    }
  }

  protected handledRequestAppAuthKeyMessage(message) {
    const appInfos: AppInfo[] = this.appContextService.getAuthKeyUnacknowledgedApps();
    this.logger.debug('AppMessageService.handledRequestAppAuthKeyMessage.authKeyUnacknowledgedApps:', appInfos);
    appInfos.forEach((appInfo) => {
      if (appInfo && appInfo.window && !appInfo.window.closed) {
        appInfo.openedSeqNo = this.appContextService.nextOpenedAppSeqNo();
        // send auth keys to the opened applications which not logged in yet
        const appAuthKey = new AppAuthKey(this.authService.getTokenStorageKey(), this.cryptoKeyService.getCryptoKey());
        const msg = {
          messageType: 'replyAppAuthKey',
          targetAppInstanceId: message.data.fromAppInstanceId,
          openedSeqNo: appInfo.openedSeqNo,
          data: appAuthKey
        };
        appInfo.window.postMessage(msg, appInfo.window.location.origin);
        this.logger.debug('AppMessageService.handledRequestAppAuthKeyMessage -> Replied auth keys completely!!!');
      }
    });
  }

  protected handleAcknowledgeAppAuthKeyMessage(message) {
    const appInfo = this.appContextService.getAppInfoByOpenedSeqNo(message.data.openedSeqNo);
    if (appInfo) {
      appInfo.appInstanceId = message.data.fromAppInstanceId;
      appInfo.isAppAuthKeyAcknowledged = true;
    }
    this.logger.debug('AppMessageService.handleAcknowledgeAppAuthKeyMessage.acknowledgedAppInfo', appInfo);
  }

  protected handleReplyAppAuthKeyMessage(message) {
    if (window.opener && this.appContextService.getAppAuthKeyReplyCount() !== 0) {
      return;
    }
    this.logger.debug('AppMessageService.handleReplyAppAuthKeyMessage.receivedAppAuthKey', message.data.data);

    // send message to openner to acknowledge auth keys
    window.opener.postMessage({
      messageType: 'acknowledgeAppAuthKey',
      fromAppInstanceId: message.data.targetAppInstanceId,
      openedSeqNo: message.data.openedSeqNo
    }, window.opener.origin);
    this.logger.debug('AppMessageService.handleReplyAppAuthKeyMessage -> Sent message to opener to acknowledge app auth keys!!!');

    this.cryptoKeyService.setCryptoKey(message.data.data.cryptoKey);
    this.authService.setTokenStorageKey(message.data.data.tokenStorageKey);
    if (this.authService.hasValidAuthToken()) {
      this.authService.startRefreshTokenTimer();
      this.logger.debug('AppMessageService.handleReplyAppAuthKeyMessage: started refresh token timer ......................');
    }

    this.appContextService.setAppAuthKeyFlag(true);
  }

}
