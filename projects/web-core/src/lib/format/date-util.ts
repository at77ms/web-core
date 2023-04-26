import { formatDate as nativeFormatDate } from '@angular/common';
import { AppConfService } from '../service/app-conf.service';
import { parse, format } from 'date-fns';

export class DateUtil {
  static formatDate(value: string | number | Date, dateFormat?: string, locale?: string, timeZone?: string): string {
    dateFormat = dateFormat || AppConfService.getInstance().getDateValueFormat();
    locale = locale || AppConfService.getInstance().getLocale();
    timeZone = timeZone || AppConfService.getInstance().getTimeZone();
    return nativeFormatDate(value, dateFormat, locale, timeZone);
  }

  static formatDateTime(value: string | number | Date, dateFormat?: string, locale?: string, timeZone?: string): string {
    dateFormat = dateFormat || AppConfService.getInstance().getDateTimeValueFormat();
    locale = locale || AppConfService.getInstance().getLocale();
    timeZone = timeZone || AppConfService.getInstance().getTimeZone();
    return nativeFormatDate(value, dateFormat, locale, timeZone);
  }

  static formatLongDateTime(value: string | number | Date, dateFormat?: string, locale?: string, timeZone?: string): string {
    dateFormat = dateFormat || AppConfService.getInstance().getLongDateTimeValueFormat();
    locale = locale || AppConfService.getInstance().getLocale();
    timeZone = timeZone || AppConfService.getInstance().getTimeZone();
    return nativeFormatDate(value, dateFormat, locale, timeZone);
  }

  static formatToHyphenDate(date: string) {
    // MMddyyyy format to yyyy-MM-dd
    if (date) {
      return date.slice(4, 8) + '-' + date.slice(0, 2) + '-' + date.slice(2, 4);
    }
  }

  private static getDateFormat() {
    const backEndDateFormat = AppConfService.getInstance().getBackEndDateFormat();
    const frontEndDateFormat = AppConfService.getInstance().getFrontEndDateFormat();
    return { backEndDateFormat, frontEndDateFormat };
  }

  private static getTimeFormat() {
    const backEndTimeFormat = AppConfService.getInstance().getBackEndTimeFormat();
    const frontEndTimeFormat = AppConfService.getInstance().getFrontEndTimeFormat();
    return { frontEndTimeFormat, backEndTimeFormat };
  }

  private static getTimezoneOffsetMilliSecond(): number {
    const localTimezoneOffset = new Date().getTimezoneOffset();
    const backEndTimezoneOffset = AppConfService.getInstance().getBackEndTimezoneOffset();
    return (localTimezoneOffset - backEndTimezoneOffset) * 60 * 1000;
  }

  // <<<<<<<<back end string, front end string>>>>>>>> --- start
  // example: '2019-10-09' --->>> '10092019'(yyyy-MM-dd --->>> MMddyyyy)
  static backEndStrToFrontEndDateStr(backEndDateStr: string): string {
    const { backEndDateFormat, frontEndDateFormat } = DateUtil.getDateFormat();
    const date = parse(backEndDateStr, backEndDateFormat, new Date());
    return format(date, frontEndDateFormat);
  }

  // example: '2019-10-09 12:26:28' --->>> '10092019122628'(yyyy-MM-dd HH:mm:ss --->>> MMddyyyyHHmmss)
  static backEndStrToFrontEndTimeStr(backEndTimeStr: string): string {
    const { frontEndTimeFormat, backEndTimeFormat } = DateUtil.getTimeFormat();
    const time = parse(backEndTimeStr, backEndTimeFormat, new Date());
    return format(time, frontEndTimeFormat);
  }

  // example: '10092019' --->>> '2019-10-09'
  static frontEndStrToBackEndDateStr(frontEndDateStr: string): string {
    const { backEndDateFormat, frontEndDateFormat } = DateUtil.getDateFormat();
    const date = parse(frontEndDateStr, frontEndDateFormat, new Date());
    return format(date, backEndDateFormat);
  }

  // example: '10092019122628' --->>> '2019-10-09 12:26:28'
  static frontEndStrToBackEndTimeStr(frontEndTimeStr: string): string {
    const { frontEndTimeFormat, backEndTimeFormat } = DateUtil.getTimeFormat();
    const time = parse(frontEndTimeStr, frontEndTimeFormat, new Date());
    return format(time, backEndTimeFormat);
  }
  // <<<<<<<<back end string, front end string>>>>>>>> --- end

  // <<<<<<<<back end string, front end Date>>>>>>>> --- start
  // example: '2019-10-09'(yyyy-MM-dd) --->>>
  //    JS Date Object('Wed Oct 09 2019 00:00:00 GMT+0800' OR 'Wed Oct 09 2019 00:00:00 GMT+0700'...etc)
  // It will have different values depending on the time zone.
  static backEndDateStrToLocalDate(backEndDateStr: string): Date {
    const backEndDateFormat = AppConfService.getInstance().getBackEndDateFormat();
    return parse(backEndDateStr, backEndDateFormat, new Date());
  }

  // example: '2019-10-09 01:02:03'(yyyy-MM-dd HH:mm:ss) --->>> JS Date Object
  // ('Wed Oct 09 2019 01:02:03 GMT+0800' OR 'Wed Oct 09 2019 01:02:03 GMT+0700'...etc)
  // It will have different values depending on the time zone.
  static backEndTimeStrToLocalDate(backEndTimeStr: string): Date {
    const backEndTimeFormat = AppConfService.getInstance().getBackEndTimeFormat();
    return parse(backEndTimeStr, backEndTimeFormat, new Date());
  }

  // example: JS Date Object'Wed Oct 09 2019 01:02:03 GMT+0800' --->>> '10092019'(MMddyyyy)
  // example: JS Date Object'Wed Oct 09 2019 01:02:03 GMT+0700' --->>> '10092019'(MMddyyyy)
  static dateToFrontEndDateStr(date: Date): string {
    const fronEndDateFormat = AppConfService.getInstance().getFrontEndDateFormat();
    return format(date, fronEndDateFormat);
  }

  // example: JS Date Object'Wed Oct 09 2019 01:02:03 GMT+0800' --->>> '10092019010203'(MMddyyyyHHmmss)
  // example: JS Date Object'Wed Oct 09 2019 01:02:03 GMT+0700' --->>> '10092019010203'(MMddyyyyHHmmss)
  static dateToFrontEndTimeStr(date: Date): string {
    const frontEndTimeFormat = AppConfService.getInstance().getFrontEndTimeFormat();
    return format(date, frontEndTimeFormat);
  }

  // example: JS Date Object'Wed Oct 09 2019 01:02:03 GMT+0800' --->>> '2019-10-09'(yyyy-MM-dd)
  // example: JS Date Object'Wed Oct 09 2019 01:02:03 GMT+0700' --->>> '2019-10-09'(yyyy-MM-dd)
  static dateToBackEndDateStr(date: Date): string {
    const backEndDateFormat = AppConfService.getInstance().getBackEndDateFormat();
    return format(date, backEndDateFormat);
  }

  // example: JS Date Object'Wed Oct 09 2019 01:02:03 GMT+0800' --->>> '2019-10-09 01:02:03'(yyyy-MM-dd HH:mm:ss)
  // example: JS Date Object'Wed Oct 09 2019 01:02:03 GMT+0700' --->>> '2019-10-09 01:02:03'(yyyy-MM-dd HH:mm:ss)
  static dateToBackEndTimeStr(date: Date): string {
    const backEndTimeFormat = AppConfService.getInstance().getBackEndTimeFormat();
    return format(date, backEndTimeFormat);
  }
  // <<<<<<<<back end string, front end Date>>>>>>>> --- end

  // <<<<<<<<back end number, front end number>>>>>>>> --- start
  // the date object getTime value is 1570602931786, the backEndTimezoneOffset is -480
  // if the user is in GMT+0800 it will transfer to 'Wed Oct 09 2019 14:35:31 GMT+0800'
  // if the user is in GMT+0700 it will transfer to 'Wed Oct 09 2019 14:35:31 GMT+0700'
  static milliSecondToLocalDate(milliSecond: number): Date {
    return new Date(milliSecond + this.getTimezoneOffsetMilliSecond());
  }

  // the date object getTime value is 1570602931786, the backEndTimezoneOffset is -480
  // if the user is in GMT+0800 it will transfer to '10092019'
  // if the user is in GMT+0700 it will transfer to '10092019'
  static milliSecondToFrontEndDateStr(milliSecond: number): string {
    const frontEndDateFormat = AppConfService.getInstance().getFrontEndDateFormat();
    return format(DateUtil.milliSecondToLocalDate(milliSecond), frontEndDateFormat);
  }

  // the date object getTime value is 1570602931786, the backEndTimezoneOffset is -480
  // if the user is in GMT+0800 it will transfer to '10092019143531'
  // if the user is in GMT+0700 it will transfer to '10092019143531'
  static milliSecondToFrontEndTimeStr(milliSecond: number): string {
    const frontEndTimeFormat = AppConfService.getInstance().getFrontEndTimeFormat();
    return format(DateUtil.milliSecondToLocalDate(milliSecond), frontEndTimeFormat);
  }

  // the date object getTime value is 1570602931786, the backEndTimezoneOffset is -480
  // if the user is in GMT+0800 it will transfer to '2019-10-09'
  // if the user is in GMT+0700 it will transfer to '2019-10-09'
  static milliSecondToBackEndDateStr(milliSecond: number): string {
    const backEndDateFormat = AppConfService.getInstance().getBackEndDateFormat();
    return format(DateUtil.milliSecondToLocalDate(milliSecond), backEndDateFormat);
  }

  // the date object getTime value is 1570602931786, the backEndTimezoneOffset is -480
  // if the user is in GMT+0800 it will transfer to '2019-10-09 14:35:31'
  // if the user is in GMT+0700 it will transfer to '2019-10-09 14:35:31'
  static milliSecondToBackEndTimeStr(milliSecond: number): string {
    const backEndTimeFormat = AppConfService.getInstance().getBackEndTimeFormat();
    return format(DateUtil.milliSecondToLocalDate(milliSecond), backEndTimeFormat);
  }

  // the front end date string is '10092019', the backEndTimezoneOffset is -480
  // if the user is in GMT+0800 it will transfer to 1570550400000
  // if the user is in GMT+0700 it will transfer to 1570550400000
  static frontEndDateStrToMilliSecond(frontEndDateStr: string): number {
    const frontEndDateFormat = AppConfService.getInstance().getFrontEndDateFormat();
    const date = parse(frontEndDateStr, frontEndDateFormat, new Date());
    return date.getTime() - this.getTimezoneOffsetMilliSecond();
  }

  // the front end date string is '10092019143531', the backEndTimezoneOffset is -480
  // if the user is in GMT+0800 it will transfer to 1570602931786
  // if the user is in GMT+0700 it will transfer to 1570602931786
  static frontEndTimeStrToMilliSecond(frontEndTimeStr: string): number {
    const frontEndTimeFormat = AppConfService.getInstance().getFrontEndTimeFormat();
    const time = parse(frontEndTimeStr, frontEndTimeFormat, new Date());
    return time.getTime() - this.getTimezoneOffsetMilliSecond();
  }
  // <<<<<<<<back end number, front end number>>>>>>>> --- end

}
