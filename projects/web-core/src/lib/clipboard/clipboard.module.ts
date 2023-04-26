import { ClipboardDirective } from './clipboard.directive';
import { CLIPBOARD_SERVICE_PROVIDER } from './clipboard.service';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { WINDOW, _window } from './window-token';

@NgModule({
  imports: [CommonModule],
  // tslint:disable-next-line:object-literal-sort-keys
  declarations: [ClipboardDirective],
  exports: [ClipboardDirective],
  providers: [
    {
      provide: WINDOW,
      useFactory: _window
    },
    CLIPBOARD_SERVICE_PROVIDER
  ]
})
export class ClipboardModule {}
