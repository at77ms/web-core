import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Logger } from '../logger';

@Injectable({
  providedIn: 'root'
})
export class AppConfService {
  private static instance: AppConfService = null;

  // tslint:disable-next-line: ban-types
  private confMap: Map<string, string | any[] | Object> = new Map<string, string | Array<any> | object>();

  constructor(private http: HttpClient, private logger: Logger) {
    AppConfService.instance = this;
  }

  static getInstance(): AppConfService {
    return AppConfService.instance;
  }

  loadConf(confUrl: string): Promise<any> {
    if (!confUrl) {
      return ;
    }

    const promise = this.http.get(confUrl).toPromise().then(
      data => {
        this.logger.debug(`Configurations of conf file - ${confUrl}:`, data);
        if (data) {
          for (const key in data) {
            if (data.hasOwnProperty(key)) {
              this.confMap.set(key, data[key]);
            }
          }
        }
        this.logger.debug(`Current configurations after loading ${confUrl}:`, this.confMap);
      }
    );
    return promise;
  }

  getValueByName(name: string): any {
    if (!this.confMap) {
      return '';
    }
    return this.confMap.get(name);
  }

  getValueAsNumber(name: string): number {
    return this.confMap.get(name) as number;
  }

  getTimeFormat() {
    const timeFormat = this.getValueByName('timeFormat');
    return timeFormat ? timeFormat : {
      timezoneOffset: -480,
      backEndDate: 'yyyy-MM-dd',
      backEndTime: 'yyyy-MM-dd HH:mm:ss',
      frontEndDate: 'MMddyyyy',
      frontEndTime: 'MMddyyyy HH:mm:ss'
    };
  }

  getBackEndTimezoneOffset(): number {
    const backEndTimezoneOffset = this.getTimeFormat().backEndTimezoneOffset;
    // the default time zone is HongKong time GMT+0800
    return backEndTimezoneOffset ? backEndTimezoneOffset : -480;
  }

  getBackEndDateFormat(): string {
    const backEndDate = this.getTimeFormat().backEndDate;
    return backEndDate ? backEndDate : 'yyyy-MM-dd';
  }

  getBackEndTimeFormat(): string {
    const backEndTime = this.getTimeFormat().backEndTime;
    return backEndTime ? backEndTime : 'yyyy-MM-dd HH:mm:ss';
  }

  getFrontEndDateFormat(): string {
    const frontEndDate = this.getTimeFormat().frontEndDate;
    return frontEndDate ? frontEndDate : 'MMddyyyy';
  }

  getFrontEndTimeFormat(): string {
    const frontEndTime = this.getTimeFormat().frontEndTime;
    return frontEndTime ? frontEndTime : 'MMddyyyy HH:mm:ss';
  }

  getVersion() {
    return this.getValueByName('majorVersion') + '.' + this.getValueByName('minorVersion') + '.' + this.getValueByName('buildVersion');
  }

  getApplicationId() {
    return this.getValueByName('applicationId');
  }

  getRequestTimeout(): number {
    return this.getValueByName('requestTimeout') as number;
  }

  getRequestTimeoutErrorCode(): string {
    return this.getValueByName('requestTimeoutErrorCode');
  }

  getLocale(): string {
    return this.getValueByName('locale');
  }

  getTimeZone(): string {
    return this.getValueByName('timeZone');
  }

  getDateFormat(): string {
    return this.getValueByName('dateFormat');
  }

  getDateTimeFormat(): string {
    return this.getValueByName('dateTimeFormat');
  }

  getLongDateTimeFormat(): string {
    return this.getValueByName('longDateTimeFormat');
  }

  getDateValueFormat(): string {
    return this.getValueByName('dateValueFormat');
  }

  getDateTimeValueFormat(): string {
    return this.getValueByName('dateTimeValueFormat');
  }

  getLongDateTimeValueFormat(): string {
    return this.getValueByName('longDateTimeValueFormat');
  }

}
