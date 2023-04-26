import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../notification.service';
import { ClipboardService } from '../../clipboard/clipboard.service';
import { TranslateService } from '../../translate/translate.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
@Component({
  selector: 'app-error-dialog',
  templateUrl: './error-dialog.component.html',
  styleUrls: ['./error-dialog.component.css']
})
export class ErrorDialogComponent implements OnInit {
  isMessageShow = false;
  dialogHeader = 'System Error';
  showMessage: SafeHtml;
  originErrorMessage: SafeHtml;

  constructor(public notificationService: NotificationService, public clipboardService: ClipboardService,
              private translateService: TranslateService, private domSanitizer: DomSanitizer) {
  }
  ngOnInit() {
    this.notificationService.errorDialogDisplaySubject.subscribe((bool: boolean) => {
      this.isMessageShow = bool;
      this.translateService.getMessages('DAT10030').subscribe(str => {
        this.showMessage = this.domSanitizer.bypassSecurityTrustHtml(str);
        this.originErrorMessage = this.domSanitizer.bypassSecurityTrustHtml(this.notificationService.getErrorDialogMessage());
      });
    });
  }

  accept() {
    this.clipboardService.copyFromContent(this.notificationService.errorDialogMessage);
  }

  close() {
    this.notificationService.errorDialogDisplaySubject.next(false);
  }

}
