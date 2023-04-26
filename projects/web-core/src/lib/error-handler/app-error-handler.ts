import { ErrorHandler, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError } from 'rxjs';

import { NotificationService } from './notification.service';
import { DeviceDetectorService } from '../device-detector/device-detector.service';
import { TransactionService } from '../service/transaction.service';
import { AppConfService } from '../service/app-conf.service';
import { Logger } from '../logger/logger';
import { CryptoKey, CryptoUtil } from '../crypto';
import { I18nService } from '../service/i18n.service';
import { AuthenticationService } from '../auth/service/authentication.service';
import { ConfirmDialogService } from '../service/confirm-dialog.service';

@Injectable({
    providedIn: 'root',
})
export class AppErrorHandler extends ErrorHandler {
    constructor(public notificationService: NotificationService, public deviceService: DeviceDetectorService,
                private transactionService: TransactionService, private appConfService: AppConfService,
                private authenticationService: AuthenticationService, private i18nService: I18nService, private logger: Logger,
                private confirmDialogService: ConfirmDialogService) {
        super();
    }

    handleError(error: any): void {
        if (error instanceof TimeoutError) {
            this.logger.debug('AppErrorHandler.handleError.TimeoutError (ignore): ', error);
            // ignore backend related error
        } else if (error instanceof HttpErrorResponse || (error && error.message && error.message.includes('HttpErrorResponse'))) {
            this.logger.debug('AppErrorHandler.handleError.HttpErrorResponse (ignore): ', error);
            // ignore backend related error
        } else {
            this.logger.error('AppErrorHandler.handleError.OtherError: ', error);
            this.handleOtherError(error);
        }
    }

    handleBackendError(error: any, transactionId: string): void {
        this.logger.error('AppErrorHandler.handleBackendError.error: ', error, 'transactionId: ', transactionId);
        if (this.checkIfGatewayError(error)) {
            const errorMessage = {severity: 'error', summary: `Error - ${transactionId}`, detail: error.error.Exception};
            this.notificationService.add(errorMessage);
        } else if (error instanceof TimeoutError) {
            this.handleTimeoutError(transactionId);
        } else if (error instanceof HttpErrorResponse) {
            // if (error.status === 401) {
            if (this.checkIfSessionExpired(error)) {
                // IdleTimeoutService.getInstance().stopIdleMonitor();
                this.authenticationService.logout();
                this.popupSessionExpiredDialog(error.error.meta.messages[0].description);
            } else {
                this.handleHttpErrorResponse(error, transactionId);
            }
        } else {
            // this case wouldn't occur if not handle on the client-side specially, such as special handling with an RxJS operator
            // If so, special error handling would be supplemented
            this.handleOtherError(error, transactionId);
        }
    }

    // check API gateway 401 error
    private checkIfGatewayError(error) {
        if (error.error && error.error.Exception) {
            return true;
        }
        return false;
    }

    // For https://aiahk-jira.aiaazure.biz/browse/CLIENTMOD-6427 session control:
    // When a human user uses same user ID to access the same application at different place,
    // it would be considered as concurrent login. Old session would become invalid
    private checkIfSessionExpired(error): boolean {
        if (error && error.error && error.error.meta && error.error.meta.messages) {
            const errorMsgCode = error.error.meta.messages[0].code;
            const hasNewSessionCode = this.appConfService.getValueByName('hasNewSessionCode') || 'E0802';
            const sessionExpiredCode = this.appConfService.getValueByName('sessionExpiredCode') || 'E0801';
            if ([hasNewSessionCode, sessionExpiredCode].includes(errorMsgCode)) {
                return true;
            }
        }
        return false;
    }
    private popupSessionExpiredDialog(backendMsg) {
        this.confirmDialogService.showDialog({
            closable: false,
            title: 'SessionError',
            messageContent: backendMsg,
            buttons: [
                {
                    buttonLabel: 'Refresh Page',
                    callBackFN: () => {location.reload()}
                }
            ]
        });
    }

    private handleTimeoutError(transactionId?: string) {
        const errorMessage = {severity: 'error', summary: `Error - ${transactionId}`, detail: 'Timeout occured. Please retry later.'};
        let errorCode: string = this.appConfService.getRequestTimeoutErrorCode();
        if (this.appConfService.getValueByName('showTraceIdOnError')) {
            errorCode = `${errorCode} (Trace ID: ${transactionId})`;
        }
        if (errorCode) {
            this.i18nService.getMessage(errorCode).subscribe(
                data => {
                    errorMessage.detail = data;
                    this.notificationService.add(errorMessage);
                }
            );
        } else {
            this.notificationService.add(errorMessage);
        }
    }

    private handleHttpErrorResponse(error: HttpErrorResponse, transactionId?: string) {
        if (error.error instanceof ErrorEvent) {
            this.handleOtherError(error, transactionId);
        } else {
            // Backend returned an unsuccessful response code
            this.logger.debug('AppErrorHandler.handleHttpErrorResponse.backendError', error.error);

            const txnId: string = transactionId || error.headers.get('transactionId');

            if (error.error && error.error.meta && error.error.meta.messages) {
                const errorNotifys = [];

                const responseMsg = error.error.meta.messages;
                // tslint:disable-next-line: prefer-for-of
                for (let i = 0; i < responseMsg.length; i++) {
                    let tmpTxnId: string;
                    let severity = responseMsg[i].severity.toLowerCase();
                    if (severity === 'reject') {
                        severity = 'error';
                    } else if (severity === 'error') {
                        tmpTxnId = txnId;
                    }
                    errorNotifys.push({
                        severity,
                        summary: this.getErrorSummary(severity, tmpTxnId),
                        detail: responseMsg[i].description});
                }
                this.notificationService.addAll(errorNotifys);
            } else {
                // the error is not from MicorService Backend, processing as
                this.handleOtherError(error.message, txnId);
            }
        }
    }

    private handleOtherError(error: any, transactionId?: string) {
        const txnId: string = transactionId || this.transactionService.genTransactionId();
        this.logger.debug('AppErrorHandler.handleOtherError.transactionId: ', transactionId);

        const errorMessage: string = this.encryptErrorMessage(this.prepareErrorMessage(error), txnId);
        this.promptCopyDialog(errorMessage);
    }

    private promptCopyDialog(errorMessage: string): void {
        this.notificationService.setErrorDialogMessage(errorMessage);
    }

    private prepareErrorMessage(error: any): object {
        if (! error) {
          return null;
        }

        const errorDetailMessage: any = {};
        const deviceInfo = this.deviceService.getDeviceInfo();
        this.logger.debug('deviceInfo', deviceInfo);

        errorDetailMessage.deviceInfo = JSON.stringify(deviceInfo);

        const errorIncurDateTime: Date = new Date();
        errorDetailMessage.errorIncurDateTime = errorIncurDateTime;

        const errorMessage = this.extractErrorInfo(error);
        errorDetailMessage.errorMessage = JSON.stringify(errorMessage);

        return errorDetailMessage;
      }

    private encryptErrorMessage(errorMessage, transactionId: string): any {
        if (! errorMessage) {
            return null;
        }

        const plainErrorMessageStr: string = JSON.stringify(errorMessage);
        this.logger.debug('Error Message: ', plainErrorMessageStr);

        const cryptoKey: CryptoKey = new CryptoKey(transactionId, transactionId, transactionId);

        const encryptedErrorMessage: string = CryptoUtil.encrypt(plainErrorMessageStr, cryptoKey);
        this.logger.debug('Encrypted Error Message: ', encryptedErrorMessage);

        const finalErrorMessage = `${transactionId}-${encryptedErrorMessage}`;
        return finalErrorMessage;
    }

    private extractErrorInfo(error: any) {
        let errorMessage: any = {};
        if (typeof error === 'string' ) {
          errorMessage.message = error;
        } else if (error instanceof HttpErrorResponse) {
          errorMessage = this.extractErrorInfoFromHttpErrorResponse(error);
        } else {
          errorMessage.message = error.stack;
        }
        return errorMessage;
    }

    private extractErrorInfoFromHttpErrorResponse(error: HttpErrorResponse) {
        const errorInfo: any = {};
        if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred. Handle it accordingly
            errorInfo.message = error.error.message;
        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong,
            errorInfo.statusCode = error.status;
            errorInfo.message = error.error;
        }
        return errorInfo;
    }

    private getErrorSummary(severity: string, txnId: string = null): string {
        let summary = 'Error';
        if (severity) {
            if (severity.length > 1) {
                summary = severity[0].toUpperCase() + severity.substring(1);
            } else {
                summary = severity.toUpperCase();
            }
        }
        if (txnId) {
            summary = `${summary} - ${txnId}`;
        }
        return summary;
    }

}
