import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DialogModule } from 'primeng/dialog';
import { SidebarModule } from 'primeng/sidebar';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';

import { ClipboardModule } from '../clipboard/clipboard.module';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component';
import { ErrorSidebarComponent } from './error-sidebar/error-sidebar.component';
import { NotificationBoxComponent } from './notification-box/notification-box.component';

@NgModule({
  imports: [
    CommonModule,
    DialogModule,
    SidebarModule,
    CardModule,
    ClipboardModule,
    ButtonModule,
    ToastModule
  ],
  declarations: [
    ErrorDialogComponent,
    ErrorSidebarComponent,
    NotificationBoxComponent
  ],
  exports: [
    ErrorDialogComponent,
    ErrorSidebarComponent,
    NotificationBoxComponent
  ],
  providers: [
  ]
})
export class ErrorHandlerModule {}
