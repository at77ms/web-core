import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-menu-bar',
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.css']
})
// tslint:disable-next-line: component-class-suffix
export class MenuBarComponent1 {
  isOverlayMenu = true;
  @Input() menuItems: any;

  constructor() { }

}
