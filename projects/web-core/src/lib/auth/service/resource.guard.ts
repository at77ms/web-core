import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateChild } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthorizationService } from './authorization.service';
import { AppConfService } from '../../service/app-conf.service';
import { ConfirmDialogService } from '../../service/confirm-dialog.service';

interface AccessCodeObject {
  noAccessRightCode: string;
  haveAccessRightCode: string;
  editAccessRightCode: string;
  allAccessRightCode: string;
}
/**
 * This guard is for resource control, decide whether the user can use the component;
 * you can view what authority the user have by use this SQL: SELECT * FROM aidcconfig.dbo.tuser_authority WHERE user_id='xxxxxxx'
 * use this in the *.routing.module, each component or lazy load module should set a data obj with a resourceId key
 * set the component or lazy load module 'data' object 'resourceId' key same as the aidcconfig.dbo.tuser_authority.func_name
 * you need to add the ConfirmDialogModule to the app.module.ts
 * and add the <app-confirm-dialog></app-confirm-dialog> to the app.component.html to get error confirm dialog
 * when you want all the child componet to use this guard, you can reference to below example:
 * @NgModule({
 *   imports: [
 *     RouterModule.forRoot([
 *       {
 *         path: '',
 *         component: MainComponent,
 *         canActivateChild: [ResourceGuard]
 *         children: [
 *            { path: 'standalone',
 *              loadChildren: '../standalone/standalone.module#StandaloneModule',
 *              data: { resourceId: 'base_sl'}
 *            }, {
 *              path: 'taskList',
 *              loadChildren: '../task/task.module#TaskModule',
 *              data: { resourceId: 'base_tl'}
 *            }, {
 *              path: 'pos', loadChildren: '../pos/pos.module#PosModule',
 *              data: {
 *                resourceId: 'base_mm'
 *              }
 *            }
 *         ]
 *       }
 *     ])
 *   ],
 *   providers: [ResourceGuard]
 * })
 *
 * when you want to control each componet or lazy load child module independently, you can reference to below example:
 * @NgModule({
 *   imports: [
 *     RouterModule.forRoot([
 *       {
 *         path: '',
 *         component: MainComponent,
 *         children: [
 *            { path: 'standalone',
 *              loadChildren: '../standalone/standalone.module#StandaloneModule',
 *              canActivate: [ResourceGuard]
 *              data: { resourceId: 'base_sl'}
 *            }, {
 *              path: 'taskList',
 *              loadChildren: '../task/task.module#TaskModule',
 *              canActivate: [ResourceGuard],
 *              data: { resourceId: 'base_tl'}
 *            }, {
 *              path: 'pos', loadChildren: '../pos/pos.module#PosModule',
 *              canActivate: [ResourceGuard],
 *              data: {
 *                resourceId: 'base_mm'
 *              }
 *            }
 *         ]
 *       }
 *     ])
 *   ],
 *   providers: [ResourceGuard]
 * })
 */
@Injectable({
  providedIn: 'root'
})
export class ResourceGuard implements CanActivate, CanActivateChild {
  private userAuthorityList = this.authorizationService.getUserAuthorityList();
  private defaultAccessCodeObject: AccessCodeObject = {
    noAccessRightCode: '00',
    haveAccessRightCode: '20',
    editAccessRightCode: '50',
    allAccessRightCode: '90',
  };
  private haveAccessCodeList: string[] = this.transformAccessObjToArray(this.getAccessCodeObject());

  constructor(private authorizationService: AuthorizationService, private appConfService: AppConfService,
              private confirmDialogService: ConfirmDialogService) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (next.data && next.data.resourceId) {
      return this.haveAccessAuthorizate(next.data.resourceId);
    }
    return true;
  }
  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (next.data && next.data.resourceId) {
      return this.haveAccessAuthorizate(next.data.resourceId);
    }
    return true;
  }
  private haveAccessAuthorizate(resourceId): boolean {
    const arr = this.userAuthorityList.filter(item => item.funcName === resourceId).
      // filter(item => ['20', '50', '90'].includes(item['securityLevel']));
      // by default expect this.haveAccessCodeList = ['20', '50', '90'];
      filter(item => this.haveAccessCodeList.includes(item.securityLevel));
    if (arr.length) {
      return true;
    } else {
      this.popUpDialog();
      return false;
    }
  }
  private popUpDialog() {
    this.confirmDialogService.showDialog({
      closable: false,
      title: 'LbNotAccess',
      messageContent: 'MSG10003',
      buttons: [
        {
          buttonLabel: 'OK',
          callBackFN: () => {}
        }
      ]
    });
  }
  private getAccessCodeObject(): AccessCodeObject {
    const accessCodeObject = this.appConfService.getValueByName('accessCodeObject');
    if (accessCodeObject) {
      return accessCodeObject;
    }
    return this.defaultAccessCodeObject;
  }
  private transformAccessObjToArray(accessCodeObject: AccessCodeObject): string[] {
    const accessCodeArray = [];
    if (accessCodeObject.haveAccessRightCode) {
      accessCodeArray.push(accessCodeObject.haveAccessRightCode);
    }
    if (accessCodeObject.editAccessRightCode) {
      accessCodeArray.push(accessCodeObject.editAccessRightCode);
    }
    if (accessCodeObject.allAccessRightCode) {
      accessCodeArray.push(accessCodeObject.allAccessRightCode);
    }
    return accessCodeArray;
  }
}
