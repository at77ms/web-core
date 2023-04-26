import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './search.component';
import { SearchResultsComponent } from './search-results/search-results.component';

@NgModule({
  declarations: [SearchComponent, SearchResultsComponent],
  imports: [
    CommonModule,
  ],
  exports: [
    SearchComponent,
    SearchResultsComponent,
  ]
})
export class SearchModule { }
