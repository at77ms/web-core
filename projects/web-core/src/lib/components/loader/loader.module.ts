import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LoaderComponent } from './loader.component';

@NgModule({
  imports: [
    CommonModule,
    ProgressSpinnerModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [ LoaderComponent ],
  providers: [],
  exports: [
    LoaderComponent
  ]

})
export class LoaderModule { }
