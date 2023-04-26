import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {DialogModule} from 'primeng/dialog';
import {ButtonModule} from 'primeng/button';

import { ConfirmDialogComponent } from './confirm-dialog.component';
import { TranslateModule } from '../../translate/translate.module';

@NgModule({
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    TranslateModule
  ],
  declarations: [ConfirmDialogComponent],
  exports: [ConfirmDialogComponent]
})
export class ConfirmDialogModule { }
