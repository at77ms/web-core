import { Component, Injector, ViewChild, ElementRef, OnInit, DoCheck, Input, EventEmitter, Output } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ControlValueAccessorConnector } from './control-value-accessor-connector';

// This component use for the input number field
// -------------------code example:------------------------------
// ------code in the Module file:--------------------------------
// import the InputNumberModule
// ------code in the TS file:------------------------------------
// doSomethingOnFocus(event: Event) {
// }
// doSomethingOnBlur(event: Event) {
// }
// doSomethingOnChange(value) {
// }
// createTopForm = (data) => {
//   return new FormManager({
//     formValidations: {
//       currency: { value: { value: '', disabled: false }, rules: 'number' },
//     }
//   });
// };
// ------code in the HTML file:------------------------------------
// code in HTML:
// <div class="ui-n-3">
//    <app-label [label]="'Currency'"></app-label>
//    <app-inputNumber formControlName="currency" (onFocus)="doSomethingOnFocus($event)"
//      (onBlur)="doSomethingOnBlur($event)" (onChange)="doSomethingOnChange($event)"></app-inputNumber>
//    <p-message *ngIf="topForm.hasError('currency')" severity="error"
//      text="{{topForm.getError('currency') | message }}"></p-message>
// </div>
// -----------------------------------------------------------------
@Component({
  selector: 'app-inputNumber',
  template: `<input [attr.type]="'number'" [formControl]="control" style="display: none;">

            <input #showInput [attr.id]="inputId" [attr.name]="name" [ngStyle]="style" [ngClass]="styleClass"
              [attr.placeholder]="placeholder" [attr.title]="title" [attr.size]="size" [attr.autocomplete]="autocomplete"
              [attr.maxlength]="maxlength" [attr.tabindex]="tabindex" [readonly]="readonly"
              [attr.required]="required" [attr.autofocus]="autoFocus" [attr.aria-label]="ariaLabel" [attr.aria-required]="ariaRequired"
              (focus)="onInputFocus($event)" (blur)="onInputBlur($event)" [disabled]="showInputDisabled"
              [class.ui-inputtext]="true" [class.ui-corner-all]="true" [class.ui-state-default]="true" [class.ui-widget]="true"
              [class.ui-state-filled]="filled" [class.ui-inputwrapper-focus]="focus" [class.required-input]="errClass">`,
  providers: [{
    provide: NG_VALUE_ACCESSOR, useExisting: InputNumberComponent, multi: true
  }]
})
export class InputNumberComponent extends ControlValueAccessorConnector implements OnInit, DoCheck {
  @Input() inputId: string;
  @Input() name: string;
  @Input() style: any;
  @Input() styleClass: string;
  @Input() placeholder: string;
  @Input() ariaLabel: string;
  @Input() title: string;
  @Input() size: number;
  @Input() autocomplete: string;
  @Input() maxlength: number;
  @Input() tabindex: string;
  @Input() ariaRequired: boolean;
  @Input() readonly: boolean;
  @Input() required: boolean;
  @Input() autoFocus: boolean;
  @Input() defaultValueWhenUndefined: '' | 0;

  // tslint:disable: no-output-on-prefix
  // align the event name with the PrimeNG
  @Output() onFocus: EventEmitter<any> = new EventEmitter();
  @Output() onBlur: EventEmitter<any> = new EventEmitter();
  @Output() onChange: EventEmitter<any> = new EventEmitter();

  errClass: boolean;
  filled: boolean;
  focus: boolean;
  showInputDisabled: boolean;
  @ViewChild('showInput', { static: true }) showInput: ElementRef;
  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit() {
    this.setDaultValueWhenUndefined();
    this.control.valueChanges.subscribe(data => {
      this.showInput.nativeElement.value = this.addSign(data);
    });
  }

  private setDaultValueWhenUndefined() {
    if (this.control.value === undefined) {
      if (this.defaultValueWhenUndefined === 0) {
        this.control.setValue(0);
        this.showInput.nativeElement.value = 0;
      } else {
        this.control.setValue('');
        this.showInput.nativeElement.value = '';
      }
    }
  }

  ngDoCheck() {
    this.showInputDisabled = this.control.disabled;
    this.updateFilledState();
    this.updateEerClass();
  }

  writeValue(value: any) {
    this.showInput.nativeElement.value = this.addSign(value);
    this.formControlDirective.valueAccessor.writeValue(value);
    this.onChange.emit({ value });
    this.control.markAsTouched();
  }

  onInputFocus(event: Event) {
    this.showInput.nativeElement.value = this.control.value;
    this.focus = true;
    this.onFocus.emit(event);
  }

  onInputBlur(event: Event) {
    const showInputValue = this.showInput.nativeElement.value;
    this.control.setValue(showInputValue);
    this.showInput.nativeElement.value = this.addSign(showInputValue);
    this.focus = false;
    this.onBlur.emit(event);
  }

  addSign(num) {
    if (num !== null && num !== undefined) {
      const parts = num.toString().split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return parts.join('.');
    } else if ( num === undefined) {
      return '';
    } else {
      return num;
    }
  }

  updateFilledState() {
    this.filled = this.showInput.nativeElement.value.length ? true : false;
  }

  updateEerClass() {
    this.errClass = (this.control.status === 'INVALID') ? true : false;
  }
}
