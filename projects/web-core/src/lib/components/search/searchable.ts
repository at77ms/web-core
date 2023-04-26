import { NgModule, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Directive, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { SearchableElementService } from '../../service/searchable-element.service';

@Directive({
  selector: '[appSearchable]'
})
export class SearchableDirective implements OnInit, OnDestroy {
  element: ElementRef;
  elementId: string = this.searchableElementService.getUUID();
  @Input('appSearchable')
  set elementText(value: string) {
    this.element.nativeElement.innerText = value;
    if (value.trim()) {
      this.searchableElementService.elementIdSubject.next([this.elementId, value]);
    }
  }
  get elementText() {
    return this.elementText;
  }
  constructor(element: ElementRef, private searchableElementService: SearchableElementService) {
    this.element = element;
  }

  ngOnInit() {
    this.element.nativeElement.classList.add('searchFunctionCom');
    this.element.nativeElement.setAttribute('data-searchElementId', this.elementId);
  }

  ngOnDestroy() {
    this.searchableElementService.delete(this.elementId);
    this.searchableElementService.elementIdSubject.next(null);
  }

}

@NgModule({
  declarations: [SearchableDirective],
  imports: [CommonModule],
  exports: [SearchableDirective]
})
export class SearchableModule { }
