// angular module
import { NgModule, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

// primeng module
import { ButtonModule } from 'primeng/button';
import { SplitButtonModule } from 'primeng/splitbutton';

// custom component
import { ActionBarComponent } from './action-bar.component';

@NgModule({
  imports: [
    CommonModule,
    ButtonModule,
    SplitButtonModule
  ],
  declarations: [
    ActionBarComponent
  ],
  providers: [
  ],
  exports: [
    ActionBarComponent
  ]
})

export class ActionBarModule { }
