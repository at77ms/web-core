import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { EnvironmentService } from './environment.service';
import { AppConfService } from './app-conf.service';
import { Logger } from '../logger/logger';
import { AuthenticationService } from '../auth/service/authentication.service';

export interface DropdownOption {
  additionalInfo?: string;
  dictStatus?: 'A' | 'D';
  label: string;
  seqNo?: number;
  value: any;
}

/**
 * This service provide for dropdown componet to fetch the drop down option value data and refresh the backend drop down cache data.
 * for more info please reference to it's associate file dropdown-resolver.service.ts
 *
 * To refresh the backen drop down cache data, you can call the refresh-cache.component, reference the below example:
 * ---------------- example code begin-----------------
 * code in app.module.ts
 * import { RefreshCacheModule } from 'web-core';
 * import the RefreshCacheModule in the NgModule imports list
 * code in app-routing.module.ts
 * import { RefreshCacheComponent} from 'web-core';
 * { path: 'refreshcache', component: RefreshCacheComponent},
 * ----------------- example code end---------------
 *
 * To get the data for each drop down component, you can reference the below example:
 * ---------------- example code begin-----------------
 * in the html file
 * <div class="ui-n-11" [formGroup]="personalDetailsForm.getForm()">
 *   <p-dropdown [showClear]="true" [options]="personalDetailsForm.getOptions('sex')" formControlName="sex"
 *     [autoDisplayFirst]="false" [showTransitionOptions]="'0ms'" [hideTransitionOptions]="'0ms'"></p-dropdown>
 *   <p-message *ngIf="personalDetailsForm.hasError('sex')" severity="error"  text="{{personalDetailsForm.getError('sex') | message }}">
 *   </p-message>
 * </div>
 * in the ts file
 * this.personalDetailsForm = new FormManager({
 * formValidations: {'sex': { value: { value: data.sex, disabled: false}, rules: isRequired }},
 * formInfo: {moduleCode: 'dataEntry', formName: 'personalDetails'}
 * })
 * ----------------- example code end------------------
 */

@Injectable({
  providedIn: 'root'
})
export class DropdownService {
  private static instance: DropdownService = null;
  private optionData = {};
  constructor(private http: HttpClient, private environmentService: EnvironmentService,
              private logger: Logger, private authenticationService: AuthenticationService) {
    DropdownService.instance = this;
  }
  static getInstance() {
    return DropdownService.instance;
  }

  fetchOptions(requestData): Observable<any> {
    const baseUrl = this.environmentService.getApiBaseUrl('xgfe-base-OKTA', true);
    if (!baseUrl || !requestData) {
      return of([]);
    }
    const url = `${baseUrl}/dropdown/query`;
    const moduleIdList = requestData.moduleIdList;
    if (moduleIdList) {
      const requestModuleIdList = moduleIdList.filter(moduleId => {
        return !this.optionData[moduleId];
      });
      requestData.moduleIdList = requestModuleIdList;
      requestData.authorityType = 'dropdown';
      requestData['X-Auth'] = this.authenticationService.getValidAccessToken();
      if (requestModuleIdList.length === 0) {
        return of({});
      }
    }
    return this.http.post(url, requestData)
      .pipe(tap((data) => {
        if (data.data) {
          Object.assign(this.optionData, data.data);
        }
      }));
  }

  getOptions(formInfo, fieldName: string, getAllOptions: boolean = false): DropdownOption[] {
    if (!this.optionData[formInfo.moduleCode]) {
      this.logger.warn('Can\'t find the moduleCode in fetch dropdown data. Please check the moduleCode:' + formInfo.moduleCode);
      return [];
    }
    if (!this.optionData[formInfo.moduleCode][formInfo.formName]) {
      this.logger.warn('Can\'t find the moduleCode in fetch dropdown data. Please check the moduleCode:'
        + formInfo.moduleCode + ' formName: ' + formInfo.formName);
      return [];
    }
    if (getAllOptions) {
      return this.optionData[formInfo.moduleCode][formInfo.formName][fieldName];
    } else {
      const arr = this.optionData[formInfo.moduleCode][formInfo.formName][fieldName];
      if ( Array.isArray(arr)) {
        return arr.filter((item: DropdownOption) => item.dictStatus !== 'D');
      } else {
        return [];
      }
    }
  }

  getAdditionalInfo(formInfo, fieldName: string, seletedValue): string {
    const arr = this.getOptions(formInfo, fieldName, true);
    let str: string;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].value === seletedValue) {
        str = arr[i].additionalInfo;
        break;
      }
    }
    return str;
  }

  refreshCache() {
    const systemCode = AppConfService.getInstance().getValueByName('systemCode');
    const applicationId = this.environmentService.getApplicationId();
    const url = `${this.environmentService.getApiBaseUrl('xgfe-base', true)}/dropdown/refresh/${systemCode}/${applicationId}`;
    this.optionData = {};
    return this.http.get(url);
  }

}
