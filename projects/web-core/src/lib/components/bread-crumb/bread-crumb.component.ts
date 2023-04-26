import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { MenuService } from '../menu-bar/menu.service';
import { HeaderService } from '../header/header.service';

@Component({
  selector: 'app-bread-crumb',
  templateUrl: './bread-crumb.component.html',
  styleUrls: ['./bread-crumb.component.css']
})
export class BreadCrumbComponent implements OnInit, OnDestroy {
  @Input() home: object;
  @Input() style;
  @Input() styleClass: string;
  breadLabelArr;
  inputHome: object;
  inputStyle;
  inputStyleClass: string;
  laeblUnsub;
  logOutUnsub;

  constructor( private menuService: MenuService, private headerService: HeaderService) { }

  ngOnInit() {
    this.BreadCrumbInit();
    this.laeblUnsub = this.menuService.labelArrSubject.subscribe((data) => {
      this.breadLabelArr = data;
    });
    this.logOutUnsub = this.headerService.logOutSubject.subscribe(() => {
      this.breadLabelArr = [];
    });
  }
  ngOnDestroy() {
    this.laeblUnsub.unsubscribe();
    this.logOutUnsub.unsubscribe();
  }

  private BreadCrumbInit() {
    this.inputHome = this.home || { icon: 'pi pi-home' };
    this.inputStyle = this.style;
    this.inputStyleClass = this.inputStyleClass;
  }

}

