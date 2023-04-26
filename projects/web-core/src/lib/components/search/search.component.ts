import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { SearchService } from '../../service/search.service';
import { HotKeysService } from '../../hot-keys/hot-keys.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit, OnDestroy {
  showSearchResults: boolean;
  private searchDebounce = 300;
  private searchSubscription: Subscription;
  private showSubscription: Subscription;

  @ViewChild('searchBox', { static: true }) searchBox: ElementRef;

  constructor(private searchService: SearchService, private hotKeysService: HotKeysService) { }

  ngOnInit() {
    this.searchSubscription = this.searchService.searchSubject
      .pipe(
        debounceTime(this.searchDebounce),
        filter(str => (str.length > 0) && (str !== ' '))
      )
      .subscribe(query => {
        const result = this.searchService.search(query.trim());
      });
    this.showSubscription = this.searchService.resultShowSubject.subscribe((bool) => {
      this.showSearchResults = bool;
    });
    this.hotKeysService.addShortcut({keys: `alt.\\`, description: 'Search'}).subscribe(() => {
      this.focus();
    });
  }

  ngOnDestroy() {
    this.searchSubscription.unsubscribe();
    this.showSubscription.unsubscribe();
  }

  doSearch() {
    this.searchService.searchSubject.next(this.query);
    this.showSearchResults = !!this.query;
  }

  close() {
    this.showSearchResults = false;
  }

  private focus() {
    this.searchBox.nativeElement.focus();
  }

  private get query() { return this.searchBox.nativeElement.value; }
  private set query(value: string) { this.searchBox.nativeElement.value = value; }

}
