import { Component, OnInit, OnDestroy } from '@angular/core';
import { SearchService, ElementSearchObj } from '../../../service/search.service';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css']
})
export class SearchResultsComponent implements OnInit, OnDestroy {
  results: ElementSearchObj[] = [];
  subjecter: Subscription;
  constructor(private searchService: SearchService) { }

  ngOnInit() {
    this.subjecter = this.searchService.resultSubject.subscribe(data => {
      this.results = data;
    });
  }

  ngOnDestroy() {
    this.subjecter.unsubscribe();
  }

  searchItemClick(item) {
    this.searchService.resultShowSubject.next(false);
    this.searchService.itemClickSubject.next(item);
  }

}
