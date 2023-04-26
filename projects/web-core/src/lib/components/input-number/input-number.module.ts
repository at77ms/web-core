import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { InputNumberComponent } from './input-number.component';

@NgModule({
  declarations: [InputNumberComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  exports: [InputNumberComponent]
})
export class InputNumberModule { }
