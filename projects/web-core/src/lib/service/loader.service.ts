import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  private loaderSubject = new Subject<LoaderState>();

  loaderState = this.loaderSubject.asObservable();

  private requestingNum = 0;

  constructor() { }

  show() {
    this.requestingNum = this.requestingNum + 1;
    this.loaderSubject.next({ show: true } as LoaderState);
  }

  hide() {
    this.requestingNum = this.requestingNum - 1;
    if (this.requestingNum <= 0 ) {
      this.loaderSubject.next({ show: false } as LoaderState);
    }
  }

}

export interface LoaderState {
  show: boolean;
}

