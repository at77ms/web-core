import { Component, OnInit, OnDestroy } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DialogButtonItem, ConfirmDialogService, DialogSetting } from '../../service/confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent implements OnInit, OnDestroy {
  display: boolean;
  closable = true;
  title: string;
  messageContent: string;
  messageContentParams: object;
  buttons: DialogButtonItem[];
  unSubscribe$: Subject<void> = new Subject();
  dialogWidth = 350;

  constructor(private confirmDialogService: ConfirmDialogService) { }

  ngOnInit() {
    this.confirmDialogService.displaySubject
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe(display => this.display = display);

    this.confirmDialogService.settingSubject
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe((data: DialogSetting) => {
        if ( typeof data === 'object' && Array.isArray(data) === false) {
          if (data.closable === false) {
            this.closable = false;
          }
          this.title = data.title || 'Confirmation';
          this.messageContent = data.messageContent;
          this.messageContentParams = data.messageContentParams;
          this.buttons = data.buttons;
          this.dialogWidth = data.dialogWidth ? data.dialogWidth : 350;
        }
      });

  }

  ngOnDestroy() {
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }

  buttonClick(closeDialog: boolean, callFn: () => void) {
    if (closeDialog === true || closeDialog === undefined) {
      this.confirmDialogService.displaySubject.next(false);
    }
    if (typeof callFn === 'function') {
      callFn();
    }
  }

  isBtnDisabled(bool) {
    if (bool === undefined) {
      return false;
    }
    if (typeof bool !== 'boolean') {
      throw new Error('The \'DialogButtonItem\' disabled property must be a Boolean.');
    }
    return bool;
  }
}
