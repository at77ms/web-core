import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DebounceClickDirective } from './debounce-click.directive';
import { OpenPagesDirective } from './open-pages.directive';

@NgModule({
    declarations: [
      DebounceClickDirective,
      OpenPagesDirective
    ],
    imports: [CommonModule],
    providers: [],
    exports: [DebounceClickDirective, OpenPagesDirective]
  })
  export class EventModule {}
