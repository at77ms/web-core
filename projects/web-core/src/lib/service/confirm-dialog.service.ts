import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface DialogButtonItem {
  buttonLabel: string;
  dialogCloseOnClick?: boolean;
  callBackFN?: () => void;
  btnClass?: string;
  disabled?: boolean;
}

export interface DialogSetting {
  messageContent: string;
  messageContentParams?: object;
  buttons: DialogButtonItem[];
  title?: string;
  closable?: boolean;
  dialogWidth?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  displaySubject: Subject<boolean> = new Subject();
  settingSubject: Subject<DialogSetting> = new Subject();

  constructor() { }

  showDialog(data: DialogSetting) {
    this.displaySubject.next(true);
    this.settingSubject.next(data);
  }

  closeDialog() {
    this.displaySubject.next(false);
  }
}
