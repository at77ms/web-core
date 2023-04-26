import { Injectable } from '@angular/core';
import { Subject, Observable, ReplaySubject } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { Logger } from '../logger';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  // private transactionId: string = '';
  // transactionIdSubject = new ReplaySubject<string>(1);

  constructor(private logger: Logger) {
  }

  genTransactionId(): string {
    let txnId: string = uuid();
    txnId = txnId.split('-')[4];
    // this.setTransactionId(txnId);
    return txnId;
  }

  genUUID(): string {
    return uuid();
  }

  // getTransactionId(): string {
  //   return this.transactionId;
  // }

  // setTransactionId(transactionId: string) {
  //   if(transactionId) {
  //     this.transactionId = transactionId;
  //     this.transactionIdSubject.next(transactionId);
  //   }
  // }

}
