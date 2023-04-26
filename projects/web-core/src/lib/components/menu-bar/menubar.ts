/**
 * All the below components are customize edit base on primeNG menubar version 7.0.5
 */
import { NgModule, Component, ElementRef, Input, Renderer2, OnDestroy, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { DomHandler } from './domhandler';
import { MenuService } from './menu.service';
import { Logger } from '../../logger';
import { CryptoKeyService } from '../../crypto';
import { AuthenticationService } from '../../auth';
import { EnvironmentService, IdleTimeoutService } from '../../service';

// tslint:disable:max-line-length
// tslint:disable:component-class-suffix
// tslint:disable:component-selector

export interface MenuItem {
  /**
   * the application id to identify is the destination url application;
   * when it is same as current application id, click the item will call the angular router function to navigate;
   * else it will call the location.href to navigate to the new application
   */
  appId: string;
  /**
   * appBaseUrl is part of the application baseurl on the server
   * for example: the whole url is like: http://canwkd8c2xzv1.aia.biz:8085/XGFE/pos/#/requestTypeCheck?requestNo=G2030407RPOS
   * the appBaseUrl would be '/XGFE/pos/#'
   * the url should be begins with '/' and end without the '/'
   */
  appBaseUrl: string;
  /**
   * label is the text will show on the item
   */
  label?: string;
  /**
   * icon is the special icon name that will be add to the item and it will show some special icon
   * for more information about the icons please reference to: https://www.primefaces.org/showcase/ui/misc/fa.xhtml
   */
  icon?: string;
  /**
   * the command is the callback function after click the item
   */
  command?: (event?: any) => void;
  /**
   * the url is the attributes of the HTML element tag A <a href="url"></a>
   */
  url?: string;
  /**
   * routerLink is the outlet we will call in the angualr router navigate function
   * this.router.navigate(item.routerLink)
   * in our project we usually use the property.
   * the url should be begins with '/' and end without the '/'
   */
  routerLink?: any;
  /**
   * queryParams is the query params which will added the end of the url,
   * for example if we added the "queryParams": {"policyNo": "1234567890"},
   * in the end of the url it will have something like '?policyNo=1234567890'
   */
  queryParams?: { [k: string]: any };
  /**
   * when the items is set, the item will have it's sub items
   */
  items?: MenuItem[]|MenuItem[][];
  /**
   * not use
   */
  expanded?: boolean;
  /**
   * not use
   */
  disabled?: boolean;
  /**
   * visible is which the item will show
   */
  visible?: boolean;
  /**
   * set the HTML Tag A target property
   */
  target?: string;
  /**
   * angular property routerLinkActiveOptions
   * for more information please reference to: 'https://angular.cn/api/router/RouterLinkActive
   */
  routerLinkActiveOptions?: any;
  /**
   * separator set the if the separator will show
   */
  separator?: boolean;
  /**
   * add badge to a split button
   */
  badge?: string;
  /**
   * add badge class to a split button
   */
  badgeStyleClass?: string;
  /**
   * Inline style of the component.
   */
  style?: string;
  /**
   * Style class of the component.
   */
  styleClass?: string;
  /**
   * the title will show on the HTML Tag A
   */
  title?: string;
  /**
   * the id will set to the item HTML Tag A
   */
  id?: string;
  /**
   * set the HTML Tag A data-automationid property
   */
  automationId?: any;
  /**
   * use this property to storage the previous label arr
   */
  preLabelArr?: object[];
}

@Component({
  selector: 'app-menubarSub2',
  template: `
    <ul [ngClass]="{'ui-menubar-root-list':root, 'ui-widget-content ui-corner-all ui-submenu-list ui-shadow':!root}"
      (click)="listClick($event)">
      <ng-template ngFor let-child [ngForOf]="(root ? item : item.items)">
        <li *ngIf="child.separator" class="ui-menu-separator ui-widget-content" [ngClass]="{'ui-helper-hidden': child.visible === false}">
        <li *ngIf="!child.separator" #listItem [ngClass]="{'ui-menuitem ui-corner-all':true,
            'ui-menu-parent':child.items,'ui-menuitem-active':listItem==activeItem,'ui-helper-hidden': child.visible === false}"
            (mouseenter)="onItemMouseEnter($event,listItem,child)" (mouseleave)="onItemMouseLeave($event)" (click)="onItemMenuClick($event, listItem, child)">
          <a *ngIf="!child.routerLink" [href]="child.url||'#'" [attr.data-automationid]="child.automationId" [attr.target]="child.target" [attr.title]="child.title" [attr.id]="child.id" (click)="itemClick($event, child)"
            [ngClass]="{'ui-menuitem-link ui-corner-all':true,'ui-state-disabled':child.disabled}" [ngStyle]="child.style" [class]="child.styleClass">
            <span class="ui-menuitem-icon" *ngIf="child.icon" [ngClass]="child.icon"></span>
            <span class="ui-menuitem-text">{{child.label}}</span>
            <span class="ui-submenu-icon pi pi-fw" *ngIf="child.items" [ngClass]="{'pi-caret-down':root,'pi-caret-right':!root}"></span>
          </a>
          <a *ngIf="child.routerLink" [attr.data-automationid]="child.automationId" [routerLinkActive]="'ui-state-active'" [routerLinkActiveOptions]="child.routerLinkActiveOptions||{exact:false}"
            [attr.target]="child.target" [attr.title]="child.title" [attr.id]="child.id"
            (click)="customizeItemClick($event, child)" [ngClass]="{'ui-menuitem-link ui-corner-all':true,'ui-state-disabled':child.disabled}" [ngStyle]="child.style" [class]="child.styleClass"
            style="cursor: pointer;">
            <span class="ui-menuitem-icon" *ngIf="child.icon" [ngClass]="child.icon"></span>
            <span class="ui-menuitem-text">{{child.label}}</span>
            <span class="ui-submenu-icon pi pi-fw" *ngIf="child.items" [ngClass]="{'pi-caret-down':root,'pi-caret-right':!root}"></span>
          </a>
          <app-menubarSub2 class="ui-submenu" [item]="child" *ngIf="child.items" [autoDisplay]="true"></app-menubarSub2>
        </li>
      </ng-template>
    </ul>
  `,
  styleUrls: ['./menubar.css']
})
export class MenubarSub implements OnDestroy {

  @Input() item: MenuItem;

  @Input() root: boolean;

  @Input() autoDisplay: boolean;

  @Input() autoZIndex = true;

  @Input() baseZIndex = 0;

  documentClickListener: any;

  menuClick: boolean;

  menuHoverActive = false;

  activeItem: any;

  hideTimeout: any;

  activeMenu: any;

  constructor(public renderer: Renderer2, private cd: ChangeDetectorRef, private logger: Logger,
              private router: Router, private cryptoKeyService: CryptoKeyService, private authenticationService: AuthenticationService,
              private menuService: MenuService, private idleTimeoutService: IdleTimeoutService) { }

  onItemMenuClick(event: Event, item: HTMLLIElement, menuitem: MenuItem) {
    if (!this.autoDisplay) {
      if (menuitem.disabled) {
        return;
      }

      this.activeItem = this.activeMenu ? (this.activeMenu.isEqualNode(item) ? null : item) : item;
      const nextElement = item.children[0].nextElementSibling as HTMLLIElement;
      if (nextElement) {
        const sublist = nextElement.children[0] as HTMLUListElement;
        if (this.autoZIndex) {
          sublist.style.zIndex = String(this.baseZIndex + (++DomHandler.zindex));
        }

        if (this.root) {
          sublist.style.top = DomHandler.getOuterHeight(item.children[0]) + 'px';
          sublist.style.left = '0px';
        } else {
          sublist.style.top = '0px';
          sublist.style.left = DomHandler.getOuterWidth(item.children[0]) + 'px';
        }
      }

      this.menuClick = true;
      this.menuHoverActive = this.activeMenu ? (!this.activeMenu.isEqualNode(item)) : true;
      this.activeMenu = this.activeMenu ? (this.activeMenu.isEqualNode(item) ? null : item) : item;
      this.bindEventListener();
    }
  }

  bindEventListener() {
    if (!this.documentClickListener) {
      this.documentClickListener = this.renderer.listen('document', 'click', (event) => {
        if (!this.menuClick) {
          this.activeItem = null;
          this.menuHoverActive = false;
        }
        this.menuClick = false;
      });
    }
  }

  onItemMouseEnter(event: Event, item: HTMLLIElement, menuitem: MenuItem) {
    if (this.autoDisplay || (!this.autoDisplay && this.root && this.menuHoverActive)) {
      if (menuitem.disabled) {
        return;
      }

      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);
        this.hideTimeout = null;
      }

      this.activeItem = this.activeItem ? (this.activeItem.isEqualNode(item) ? null : item) : item;
      const nextElement = item.children[0].nextElementSibling as HTMLLIElement;
      if (nextElement) {
        const sublist = nextElement.children[0] as HTMLUListElement;
        sublist.style.zIndex = String(++DomHandler.zindex);

        if (this.root) {
          sublist.style.top = DomHandler.getOuterHeight(item.children[0]) + 'px';
          sublist.style.left = '0px';
        } else {
          sublist.style.top = '0px';
          sublist.style.left = DomHandler.getOuterWidth(item.children[0]) + 'px';
        }
      }

      this.activeMenu = this.activeMenu ? (this.activeMenu.isEqualNode(item) ? null : item) : item;
    }
  }

  onItemMouseLeave(event: Event) {
    if (this.autoDisplay) {
      this.hideTimeout = setTimeout(() => {
        this.activeItem = null;
        this.cd.markForCheck();
      }, 250);
    }
  }

  itemClick(event, item: MenuItem) {
    if (item.disabled) {
      event.preventDefault();
      return;
    }

    if (!item.url) {
      event.preventDefault();
    }

    if (Array.isArray(item.routerLink) && item.routerLink[0]) {
      this.menuService.setLabelsByItemClick(item);
    }

    if (typeof(item.command) === 'function') {
      item.command({
        originalEvent: event,
        item
      });
    }

    this.activeItem = null;
  }

  customizeItemClick(event, item: MenuItem) {
    this.itemClick(event, item);
    this.logger.debug(item);
    if (item.disabled) {
      event.preventDefault();
      return;
    }

    const currentAppId = EnvironmentService.getInstance().getApplicationId();
    if (item.routerLink[0] === null) {
      return;
    } else if (item.appId === currentAppId) {
      this.router.navigate(item.routerLink);
    } else {
      // const originalName = window.name;
      // const transportData = { cryptoKey: this.cryptoKeyService.getCryptoKey(),
      //                         tokenStorageKey: this.authenticationService.getTokenStorageKey()
      //                       };
      // const obj = {originalName, appId: item.appId, transportData};
      // this.logger.debug(obj);
      // const str = JSON.stringify(obj);
      // window.name = str;
      const appBaseUrl = item.appBaseUrl;
      this.logger.debug(location.origin + appBaseUrl + item.routerLink);
      this.authenticationService.stopRefreshTokenTimer();
      this.idleTimeoutService.stopIdleMonitor();
      if (typeof appBaseUrl === 'string' && appBaseUrl.startsWith('http')) {
        location.href = appBaseUrl + item.routerLink;
      } else {
        location.href = location.origin + appBaseUrl + item.routerLink;
      }
    }
  }

  listClick(event) {
    if (this.autoDisplay) {
      this.activeItem = null;
    }
  }

  ngOnDestroy() {
    if (this.documentClickListener) {
      this.documentClickListener();
      this.documentClickListener = null;
    }

  }

}

@Component({
  selector: 'app-menubar-base2',
  template: `
    <div [ngClass]="{'ui-menubar ui-widget ui-widget-content ui-corner-all':true}" [class]="styleClass" [ngStyle]="style">
      <app-menubarSub2 [item]="model" root="root" [autoDisplay]="autoDisplay" [baseZIndex]="baseZIndex" [autoZIndex]="autoZIndex">
        <ng-content></ng-content>
      </app-menubarSub2>
      <div class="ui-menubar-custom">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styleUrls: ['./menubar.css']
})

export class Menubar {

  @Input() model: MenuItem[];

  @Input() style: any;

  @Input() styleClass: string;

  @Input() autoDisplay = true;

  @Input() autoZIndex = true;

  @Input() baseZIndex = 0;

  constructor(public el: ElementRef, public renderer: Renderer2) { }
}

@Component({
  selector: 'app-menu-bar',
  template: `
              <div id="system-menu-bar" class="row" >
                <app-menubar-base2  class="mid-font-size" [model]="menuItemArr" [style]="{'border-top':'none','position':'absolute','width':'100%','min-height':'53px'}"></app-menubar-base2>
              </div>
            `,
  styleUrls: ['./menubar.css']
})
export class MenuBarComponent implements OnInit {
  public menuItemArr;

  constructor(private menuService: MenuService) { }
  @Input() menuData: [];
  ngOnInit() {
    if ( this.menuData ) {
      this.menuItemArr = this.menuData;
      this.menuService.setLabelsByUrl(this.menuItemArr);
    } else {
      this.initMenuItem();
    }
  }

  private initMenuItem() {
    this.menuService.getMenuItems()
      .pipe(take(1))
      .subscribe((data: any) => {
        if ( data.data === null ) {
          data.data = [];
        }
        this.menuItemArr = data.data;
        this.menuService.setLabelsByUrl(this.menuItemArr);
      });
  }
}

@NgModule({
  imports: [CommonModule, RouterModule],
  exports: [Menubar, RouterModule, MenuBarComponent],
  declarations: [Menubar, MenubarSub, MenuBarComponent],
  providers: [MenuService]
})
export class MenuBarModule { }
