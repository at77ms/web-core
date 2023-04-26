import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject, timer, Observable, of } from 'rxjs';
import { EnvironmentService } from '../../service';
import { MenuItem } from './menubar';
import { AppConfService } from '../../service/app-conf.service';
import { AuthenticationService } from '../../auth/service/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  menuItemArr;
  labelArr = [];
  labelArrSubject = new Subject();

  constructor(private http: HttpClient, private environmentService: EnvironmentService, private router: Router,
              private envService: EnvironmentService,
              private authenticationService: AuthenticationService,
              ) { }

  getMenuItems(): Observable<any> {
    const systemCode = AppConfService.getInstance().getValueByName('systemCode');
    const baseUrl = this.environmentService.getApiBaseUrl('xgfe-base-OKTA', true);
    if (baseUrl) {
      const url = `${baseUrl}/menu/queryList/` + systemCode;
      return this.http.get(url);
    } else {
      return of({data: null});
    }
  }

  setLabelsByUrl(menuItemArr: MenuItem[]) {
    this.menuItemArr = menuItemArr;
    const url = this.router.url;
    this.findeRouterLinkInMenuArr(url, menuItemArr);
    timer(100).subscribe(() => {
      this.labelArrSubject.next(this.labelArr);
    });
  }

  setLabelsByItemClick(item: MenuItem) {
    this.findMenuItemInMenuArr(item, this.menuItemArr);
    this.labelArrSubject.next(this.labelArr);
  }

  reSetBreadCrumbData() {
    this.labelArr = [];
    this.labelArrSubject.next(this.labelArr);
  }

  findeRouterLinkInMenuArr(url: string, menuArr: MenuItem[]) {
    url = this.getUrlWithouParma(url);
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < menuArr.length; i++) {
      menuArr[i].preLabelArr = [{label: menuArr[i].label}];
      if (this.haveSamerouterLink(url, menuArr[i])) {
        this.labelArr.push({label: menuArr[i].label});
        return;
      }
      this.findeRouterLinkInItems(url, menuArr[i]);
    }
    return;
  }

  findMenuItemInMenuArr(clickedItem: MenuItem, menuArr: MenuItem[]) {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < menuArr.length; i++) {
      menuArr[i].preLabelArr = [{label: menuArr[i].label}];
      if (this.isSameObject(clickedItem, menuArr[i])) {
        this.labelArr.push({label: clickedItem.label});
        return;
      }
      this.findMenuItemInItems(clickedItem, menuArr[i]);
    }
    return;
  }

  private getUrlWithouParma(url: string) {
    const index = url.indexOf('?');
    if (index === -1) {
      return url;
    }
    return url.slice(0, index);
  }

  private findMenuItemInItems(clickedItem: MenuItem, items) {
    if (Array.isArray(items.items)) {
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < items.items.length; i++) {
        this.getParentItemLabel(items.items[i], items);
        if (this.isSameObject(clickedItem, items.items[i])) {
          this.setBreadcrumbModel(items, items.items[i]);
          return;
        }

        this.findMenuItemInItems(clickedItem, items.items[i]);
      }
    }
  }
  private findeRouterLinkInItems(url: string, item) {
    if (Array.isArray(item.items)) {
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < item.items.length; i++) {
        this.getParentItemLabel(item.items[i], item);
        if (this.haveSamerouterLink(url, item.items[i])) {
          this.setBreadcrumbModel(item, item.items[i]);
          return;
        }

        this.findeRouterLinkInItems(url, item.items[i]);
      }
    }
  }

  private isSameObject(obj1, obj2) {
    if (JSON.stringify(obj1) === JSON.stringify(obj2)) {
      return true;
    }
    return false;
  }

  private haveSamerouterLink(url: string, item: MenuItem) {
    if (Array.isArray(item.routerLink) && item.routerLink[0] !== null && url === this.getUrlWithouParma(item.routerLink[0])) {
      return true;
    }
    return false;
  }

  private getParentItemLabel(currentItem, parentItem) {
    if (!currentItem.preLabelArr) {
      currentItem.preLabelArr = [...parentItem.preLabelArr, {label: currentItem.label}];
    }
  }

  private setBreadcrumbModel(items, currentItem) {
    this.labelArr = [...items.preLabelArr, {label: currentItem.label}];
  }

}
