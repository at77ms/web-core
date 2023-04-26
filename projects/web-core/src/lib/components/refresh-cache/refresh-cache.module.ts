import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RefreshCacheComponent } from './refresh-cache.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [RefreshCacheComponent],
  exports: [RefreshCacheComponent],
})
export class RefreshCacheModule { }
