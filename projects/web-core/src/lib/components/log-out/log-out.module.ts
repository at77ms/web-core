import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

import { TranslateModule } from '../../translate/translate.module';
import { LogOutComponent } from './log-out.component';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    TranslateModule,
    RouterModule
  ],
  declarations: [LogOutComponent],
  exports: [LogOutComponent, RouterModule]
})
export class LogOutModule { }
