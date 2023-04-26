import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StepsModule } from 'primeng/steps';

import { StepsBarComponent } from './steps-bar.component';

@NgModule({
  imports: [
    CommonModule,
    StepsModule
  ],
  declarations: [
    StepsBarComponent
  ],
  providers: [
  ],
  exports: [
    StepsBarComponent,
  ]
})
export class StepsBarModule { }
