import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { v4 as uuid } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class SearchableElementService {
  private elementIdList = new Map();
  readonly elementIdSubject = new Subject();

  constructor() {
    this.elementIdSubject.subscribe((data) => {
      if (this.isAdd(data)) {
        this.insert(data[0], data[1]);
      }
    });
  }

  getUUID(): string {
    return uuid();
  }

  insert(elementId: string, elementInnerText: string) {
    this.elementIdList.set(elementId, elementInnerText);
  }

  delete(elementId: string) {
    this.elementIdList.delete(elementId);
  }

  elementIdObservable(): Observable<any> {
    return new Observable((observer) => {
      const subscriber = this.elementIdSubject.subscribe((data) => {
        if (this.isAdd(data)) {
          this.insert(data[0], data[1]);
        }
        observer.next(this.elementIdList);
      });
      return () => {
        subscriber.unsubscribe();
      };
    }).pipe(debounceTime(10));
  }

  isAdd(data: any): boolean {
    return  (Array.isArray(data) && data.length === 2) ? true : false;
  }
}
