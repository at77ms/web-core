import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { SearchableElementService } from './searchable-element.service';

export interface ElementSearchObj {
  catalogIndex?: number;
  catalogRoutingUrl?: string;
  catalog: string;
  uuid: string;
  elementInnerText: string;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private allSearchableElementList: ElementSearchObj[] = [];
  readonly searchSubject = new Subject<string>();
  readonly resultSubject = new Subject<ElementSearchObj[]>();
  readonly resultShowSubject = new Subject<boolean>();
  readonly itemClickSubject = new Subject<ElementSearchObj>();
  constructor(private searchableElementService: SearchableElementService) {
  }

  setAllSearchableElementList(data: ElementSearchObj[]): void {
    this.allSearchableElementList = data;
  }

  getAllLabelsSubject(): Observable<any> {
    return this.searchableElementService.elementIdObservable();
  }

  search(str: string) {
    const result = this.allSearchableElementList.filter(label => {
      return label.elementInnerText.toLowerCase().indexOf(str.toLowerCase()) !== -1;
    });
    this.resultSubject.next(result);
    return result;
  }

}
