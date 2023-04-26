import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DatePipe } from '@angular/common';
import { AppDatePipe } from './app-date.pipe';
import { AppDatetimePipe } from './app-datetime.pipe';
import { AppDateDirective } from './app-date.directive';


@NgModule({
    declarations: [
      AppDatePipe,
      AppDatetimePipe,
      AppDateDirective
    ],
    imports: [
        CommonModule,
    ],
    providers: [DatePipe ],
    exports: [
        AppDatePipe,
        AppDatetimePipe,
        AppDateDirective
    ]
  })
  export class FormatModule {}
