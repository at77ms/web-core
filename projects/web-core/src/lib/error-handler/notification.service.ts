import { Injectable } from '@angular/core';
import { formatDate } from '@angular/common';

import { MessageService } from 'primeng/api';
import { Message } from 'primeng/components/common/api';

import { Logger } from '../logger/logger';
import { AppConfService } from '../service/app-conf.service';
import { Subject } from 'rxjs';

export const messageSeverity = {
    success: 'success',
    info: 'info',
    warn: 'warn',
    error: 'error'
};

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

    errorDialogMessage: string;
    errorDialogDisplaySubject = new Subject();

    histroyNotify: Message[] = [];
    histroyNotifyDisplay = false;

    constructor(
        private appConfService: AppConfService,
        private messageService: MessageService,
        private logger: Logger
    ) {}

    add(msgs: Message) {
        const errorNotifys = [];
        errorNotifys.push(msgs);
        this.addAll(errorNotifys);
    }

    addAll(msgs: Message[]) {
        msgs.forEach((msg) => {
            this.handleNotificationDuration(msg);
        });
        this.logger.debug('msgs', msgs);
        if (msgs !== undefined && msgs != null && msgs.length) {
            this.messageService.addAll(this.prepareCurrentNotify(msgs));
            this.createHistroyNotify(msgs);
            this.logger.debug('histroyNotify', this.histroyNotify);
        }
    }

    prepareCurrentNotify(msgArr: Message[]): Message[] {
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < msgArr.length; i++) {
            msgArr[i].key = 'notification';
            msgArr[i].data = {date: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en'), remove: false};
            if (msgArr[i].severity) {
                msgArr[i].severity = msgArr[i].severity.toLowerCase();
            }
            if (! msgArr[i].summary) {
                msgArr[i].summary = this.getDefaultMessageSummary(msgArr[i].severity);
            }
        }
        this.logger.debug('msgArr', msgArr);
        return msgArr;
    }

    createHistroyNotify(msgArr: Message[]) {
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < msgArr.length; i++) {
            this.histroyNotify.unshift(JSON.parse(JSON.stringify(msgArr[i])));
            this.histroyNotify[0].sticky = true ;
            this.histroyNotify[0].key = 'historyNotify';
        }
        if (this.histroyNotify === undefined || !this.histroyNotify.length) {
            this.messageService.add({
                key: 'historyNotify',
                severity: messageSeverity.info,
                summary: this.getDefaultMessageSummary(messageSeverity.info),
                detail: 'No history Notify.',
                sticky: true});
        } else {
            this.messageService.addAll(this.histroyNotify);
        }
    }

    clear() {
        this.messageService.clear();
    }

    removeNotify(message: Message) {
        for (let i = 0; i < this.histroyNotify.length; i++) {
            if (this.histroyNotify[i] === message) {
                this.histroyNotify.splice(i, 1);
            }
        }
    }

    setErrorDialogMessage(errorDialogMessage: string) {
        this.errorDialogMessage = errorDialogMessage;
        this.errorDialogDisplaySubject.next(true);
    }

    getErrorDialogMessage(): string {
        return this.errorDialogMessage;
    }

    private getDefaultMessageSummary(severity: string): string {
        let summary = 'Info';
        if (severity) {
            if (severity.length > 1) {
                summary = severity[0].toUpperCase() + severity.substring(1);
            } else {
                summary = severity.toUpperCase();
            }
        }

        return summary + ' Message';
    }

    // handle the 'p-toastitem' notification box duration time
    private handleNotificationDuration(msg: Message) {
        // can be set the duration when call the service.
        const msgDurationSetting = msg.life;
        if (msgDurationSetting) {
            return msg;
        } else {
            let appDurationTime: number;
            if (msg.severity === 'success') {
                appDurationTime = this.appConfService.getValueByName('notificationDurationSuccess') * 1000;
                appDurationTime = appDurationTime ? appDurationTime : 3 * 1000;
            } else if (msg.severity === 'info') {
                appDurationTime = this.appConfService.getValueByName('notificationDurationInfo') * 1000;
                appDurationTime = appDurationTime ? appDurationTime : 3 * 1000;
            } else if (msg.severity === 'warn') {
                appDurationTime = this.appConfService.getValueByName('notificationDurationWarn') * 1000;
                appDurationTime = appDurationTime ? appDurationTime : 3 * 1000;
            } else if (msg.severity === 'error') {
                appDurationTime = this.appConfService.getValueByName('notificationDurationError') * 1000;
                appDurationTime = appDurationTime ? appDurationTime : 86400 * 1000 * 7;
            } else {
                appDurationTime = 3 * 1000;
            }
            msg.life = appDurationTime;
        }
    }
}
