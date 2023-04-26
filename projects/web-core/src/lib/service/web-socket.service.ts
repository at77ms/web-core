import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { v4 as uuid } from 'uuid/v4';
import { Subject, interval } from 'rxjs';
import { timer, pipe, zip, range, Subscription } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { retryWhen, map, mergeMap, take, takeWhile } from 'rxjs/operators';
import { UserService } from './user.service';
import { EnvironmentService } from './environment.service';
import { NotificationService } from './../error-handler/notification.service';
import { Logger } from '../logger/logger';
import { TranslateService } from '../translate/translate.service';

export interface SocketMsgFrom {
  bizKey?: string;
}
interface MsgFrom {
  bizKey?: string;
  appId: string;
  userId: string;
}
export interface SocketMsgTo {
  bizKey?: string;
  appId?: string; // by defalut send to same app
  userId?: string; // by defalut send to same user
}
interface MsgTo {
  bizKey?: string;
  appId?: string; // by defalut send to same app
  userId?: string; // by defalut send to same user
}
export interface SocketSendMsg {
  action: string;
  from?: SocketMsgFrom;
  to?: SocketMsgTo;
  msgBody: object|string;
  msgType?: 'sys'|'app'|'ack';
}
interface SendMsg {
  msgId: string;
  action: string;
  from: MsgFrom;
  to: MsgTo;
  msgBody: object|string;
  msgType?: 'sys'|'app'|'ack';
}
export interface ReceiveMsg {
  action: string;
  from: MsgFrom;
  to: MsgTo;
  msgBody: string|object|any;
  msgId: string;
  msgType: string;
  sendResult?: 'S';
}
export interface ReceiveErrMsg {
  sendResult: 'E';
  originalMsg: string;
}
export interface CloseMsg {
  closedMsg: 'closedByBackend' | 'closedByUser';
}
interface HeartBeat {
  msgType: 'sys';
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  // tslint:disable: no-string-literal
  private appId = this.environmentService.getAppSocketId() || this.environmentService.getApplicationId();
  private userId: string;
  private getUuidUrl = this.environmentService.getApiBaseUrl('xgfe-socket', true) + '/uuid';
  private wsUrl = this.environmentService.getApiBaseUrl('xgfe-webSocket', true);
  private maxErrorRetryTimes = this.environmentService.getValueAsNumber('socketMaxErrorRetryTimes', 5);
  private heartbeatInterval = this.environmentService.getValueAsNumber('socketheartbeatInterval', 55);
  private errorRetryTimes = 1;

  private onOpenSubject$ = new Subject();
  private onMessageSubject$: Subject<ReceiveMsg> = new Subject();
  private onErrorSubject$: Subject<ReceiveErrMsg> = new Subject();
  private onCompletedSubject$: Subject<CloseMsg> = new Subject();
  private openObserver$: Subscription;
  private wSSubject$: Subscription;
  public get onOpen() {
    return this.onOpenSubject$;
  }
  public get onMessage(): Subject<ReceiveMsg> {
    return this.onMessageSubject$;
  }
  public get onError(): Subject<ReceiveErrMsg> {
    return this.onErrorSubject$;
  }
  public get onClose() {
    return this.onCompletedSubject$;
  }
  private wSSubject: WebSocketSubject<SendMsg|HeartBeat>;
  private connectionStatus$:
    'notConneted' | 'connecting' | 'connected' | 'err' | 'closedByUser' | 'closedByBackend' = 'notConneted';
  private get connectionStatus() {
    return this.connectionStatus$;
  }
  private set connectionStatus(value) {
    this.connectionStatus$ = value;
  }
  // private msgBuff: SendMsg[] = [];
  private lastSendMsg: SendMsg;
  private heartbeatExecuted = false;

  constructor(private userService: UserService, private environmentService: EnvironmentService,
              private httpClient: HttpClient, private logger: Logger, private translateService: TranslateService,
              private notificationService: NotificationService) {
    this.userService.getUserProfile().subscribe((data: any) => {
      this.userId = data.userId;
    });
  }

  public sendMessage(obj: SocketSendMsg): string {
    const sendMsg = this.convertMsg(obj);
    if (this.connectionStatus === 'connected') {
      this.wSSubject.next(sendMsg);
    } else {
      // this.msgBuff.push(sendMsg);
      this.lastSendMsg = sendMsg;
      this.establishConnection();
    }
    return sendMsg.msgId;
  }
  private convertMsg(obj: SocketSendMsg): SendMsg {
    obj['msgId'] = uuid();
    if (!obj.msgType) {
      obj.msgType = 'app';
    }
    if (!obj.from) {
      obj.from = {};
    }
    obj.from['appId'] = this.appId;
    obj.from['userId'] = this.userId;
    if (!obj.to) {
      obj.to = {};
    }
    if (!obj.to.appId) {
      obj.to.appId = this.appId;
    }
    if (!obj.to.userId) {
      obj.to.userId = this.userId;
    }
    return obj as SendMsg;
  }

  // private sendBuff() {
  //   if (this.msgBuff.length > 0) {
  //     this.msgBuff.forEach((item => {
  //       this.wSSubject.next(item);
  //     }));
  //     this.msgBuff = [];
  //   }
  // }
  private sendLastMsg() {
    if (this.lastSendMsg) {
      this.wSSubject.next(this.lastSendMsg);
      this.lastSendMsg = undefined;
    }
  }

  public async establishConnection() {
    if (this.connectionStatus !== 'connected' && this.connectionStatus !== 'connecting') {
      this.connectionStatus = 'connecting';
      const userData: any = await this.userService.getUserProfile().toPromise();
      this.userId = userData.userId;
      this.logger.debug('web-socket-----', this.userId);
      const openObserver = new Subject();
      const backendUuid: string = await this.getUuidAsync();
      const url = `${this.wsUrl}?uuid=${backendUuid}&appId=${this.appId}&userId=${this.userId}`;
      this.logger.debug('web-socket-----', url);
      this.openObserver$ = openObserver.subscribe(() => {
        this.logger.debug('web-socket-----', 'openObserver');
        this.connectionStatus = 'connected';
        // this.sendBuff();
        this.sendLastMsg();
        this.onOpen.next();
        this.heartbeat();
      });
      this.wSSubject = webSocket({ url, openObserver });
      this.wSSubject$ = this.wSSubject.subscribe(
        (returnMessage) => {
          this.onReturnMessage(returnMessage);
        },
        (err) => {
          // connection err, when provide a invalid uuid trigger the error
          this.onErrorMessage(err);
        },
        () => {
          // connection complete, connection url incorrect or server down will trigger this.
          this.onCompleteMessage();
        }
      );
    }
  }

  private heartbeat() {
    if (!this.heartbeatExecuted) {
      this.heartbeatExecuted = true;
      interval(this.heartbeatInterval * 1000)
        .pipe(takeWhile(() => this.connectionStatus === 'connected'))
        .subscribe(() => {
          this.wSSubject.next({ msgType: 'sys' });
        });
    }
  }

  private onReturnMessage(returnMessage) {
    if (returnMessage.sendResult === 'E') {
      this.onError.next(returnMessage);
    } else {
      this.onMessage.next(returnMessage);
    }
  }
  private onErrorMessage(err) {
    this.logger.debug('web-socket-----', 'connection err');
    this.connectionStatus = 'err';
    this.onError.next(err);
    this.reEstablishConnection();
  }
  private onCompleteMessage() {
    this.logger.debug('web-socket-----', 'connection completed');
    if (this.connectionStatus !== 'closedByUser') {
      this.connectionStatus = 'closedByBackend';
      this.reEstablishConnection();
      this.onClose.next({closedMsg: 'closedByBackend'});
    } else {
      this.onClose.next({closedMsg: 'closedByUser'});
    }
  }

  private resetSubscription() {
    if (this.openObserver$ && this.openObserver$.unsubscribe) {
      this.openObserver$.unsubscribe();
    }
    if (this.wSSubject$ && this.wSSubject$.unsubscribe) {
      this.wSSubject$.unsubscribe();
    }
  }

  private reEstablishConnection() {
    if (this.errorRetryTimes < this.maxErrorRetryTimes) {
      this.resetSubscription();
      timer(this.errorRetryTimes * 3000)
      .pipe(takeWhile(() => this.connectionStatus !== 'connected' && this.connectionStatus !== 'connecting'))
      .pipe(take(1))
      .subscribe(() => {
          this.errorRetryTimes = this.errorRetryTimes + 1;
          this.logger.debug('web-socket-----', 'errorRetryTimes: ', this.errorRetryTimes);
          this.logger.debug('web-socket-----', +new Date());
          this.establishConnection();
        });
    } else if (this.errorRetryTimes === this.maxErrorRetryTimes) {
      this.translateService.getMessages('DAT10033').subscribe(str => {
        this.notificationService.add({
          severity: 'warn', summary: `Warning`, detail: str
        });
      });
    }
  }

  public close() {
    // user close the connection manually
    if (this.wSSubject && this.wSSubject.complete) {
      this.connectionStatus = 'closedByUser';
      this.wSSubject.complete();
    }
  }

  private async getUuidAsync(): Promise<string> {
    // ErrorHandlingInterceptor will interceptor the request error
    // const data: any = await this.httpClient.get(this.getUuidUrl).pipe(this.backoff(3, 3000)).toPromise();
    // return data.data.uuid;
    return uuid();
  }

  private backoff(maxTries, ms) {
    return pipe(
      retryWhen(attempts => zip(range(1, maxTries), attempts)
        .pipe(
          map(([i]) => i * i),
          mergeMap(i => timer(i * ms))
        )
      )
    );
  }
}
