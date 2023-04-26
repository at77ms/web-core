import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  logOutSubject = new Subject();
  isInEnquiryModeSubject: Subject<boolean> = new Subject();

  constructor() { }

  switchEnquiryMode(bool: boolean) {
    this.isInEnquiryModeSubject.next(bool);
  }
}
