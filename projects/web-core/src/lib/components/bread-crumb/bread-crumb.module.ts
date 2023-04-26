import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {BreadcrumbModule as bcm} from 'primeng/breadcrumb';
import { BreadCrumbComponent } from './bread-crumb.component';

@NgModule({
  imports: [
    CommonModule,
    bcm,
  ],
  declarations: [BreadCrumbComponent],
  exports: [BreadCrumbComponent],
})
export class BreadCrumbModule { }
