import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import {AutoCompleteModule} from 'primeng/autocomplete';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

import { LabelModule } from '../label/label.module';
import { TranslateModule } from '../../translate/translate.module';

import { AddressDialogComponent } from './address-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    AutoCompleteModule,
    RadioButtonModule,
    ButtonModule,
    MessageModule,
    LabelModule,
    TranslateModule,
  ],
  declarations: [AddressDialogComponent],
  exports: [AddressDialogComponent],
})
export class AddressDialogModule { }
