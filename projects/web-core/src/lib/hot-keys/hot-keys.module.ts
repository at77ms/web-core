import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { HotKeysComponent } from './hot-keys/hot-keys.component';

@NgModule({
  declarations: [HotKeysComponent],
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    TableModule
  ],
  exports: [HotKeysComponent]
})
export class HotKeysModule { }
