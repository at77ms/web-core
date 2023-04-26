import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

import { AppConfService } from '../service/app-conf.service';

@Pipe({
  name: 'appDatetime'
})
export class AppDatetimePipe implements PipeTransform {
  readonly defaultDateTimeFormat: string = 'MM/dd/yyyy HH:mm';
  dateTimeFormat: string;

  constructor(private datePipe: DatePipe, private appConfService: AppConfService) {
    this.dateTimeFormat = this.appConfService.getValueByName('dateTimeFormat');
    if (! this.dateTimeFormat) {
      this.dateTimeFormat = this.defaultDateTimeFormat;
    }
  }

  transform(value: any, format?: string, timezone?: string, locale?: string): string | null {
    if (format === undefined) {
       format = this.dateTimeFormat;
    }
    return this.datePipe.transform(value, format, timezone, locale);
  }

}
