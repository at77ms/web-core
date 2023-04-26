import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

import { AppConfService } from '../service/app-conf.service';

@Pipe({
  name: 'appDate'
})
export class AppDatePipe implements PipeTransform {
  readonly defaultDateFormat: string = 'MM/dd/yyyy';
  dateformat: string;

  constructor(private datePipe: DatePipe, private appConfService: AppConfService) {
    this.dateformat = this.appConfService.getValueByName('dateFormat');
    if (! this.dateformat) {
      this.dateformat = this.defaultDateFormat;
    }
  }

  transform(value: any, format?: string, timezone?: string, locale?: string): string | null {
    if (format === undefined) {
       format = this.dateformat;
    }
    return this.datePipe.transform(value, format, timezone, locale);
  }

}
