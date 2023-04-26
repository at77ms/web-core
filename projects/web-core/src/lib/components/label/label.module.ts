import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabelComponent } from './label.component';
import { SearchableModule } from '../search/searchable';

@NgModule({
  imports: [
    CommonModule,
    SearchableModule
  ],
  declarations: [ LabelComponent ],
  providers: [],
  exports: [
    LabelComponent
  ]

})
export class LabelModule { }
