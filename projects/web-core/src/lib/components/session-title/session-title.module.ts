import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionTitleComponent } from './session-title.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [ SessionTitleComponent ],
  providers: [],
  exports: [
    SessionTitleComponent
  ]

})
export class SessionTitleModule { }
