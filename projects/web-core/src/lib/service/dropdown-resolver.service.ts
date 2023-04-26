import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { DropdownService } from './dropdown.service';
import { AppConfService } from './app-conf.service';
import { EnvironmentService } from './environment.service';

/**
 * This service provide for dropdown componet to fetch the drop down option value data, use this in the lazy load routing.module.ts
 * for more info please reference to it's associate file dropdown.service.ts
 * ---------------- example code begin-----------------
 * code in data-entry.routing.module.ts
 * import { DropdownResolverService } from 'web-core';
 * const dropDownRequestData = {
 *   moduleIdList: ['dataEntry']
 * };
 * const routes: Routes = [
 *   {
 *     path: '', component: DataEntryComponent,
 *     resolve: { dropdownData: DropdownResolverService }, data: { dropDownRequestData: dropDownRequestData }
 *   }
 * ];
 * ----------------- example code end------------------
 */

@Injectable({
  providedIn: 'root'
})
export class DropdownResolverService {

  constructor(private dropdownService: DropdownService, private environmentService: EnvironmentService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Observable<never> {
    const systemCode = AppConfService.getInstance().getValueByName('systemCode');
    const applicationId = this.environmentService.getApplicationId();
    const requestData = {
      systemCode,
      applicationId,
    };
    if (!route.data.dropDownRequestData) {
      throw new Error('Please set the routing resolve data dropDownRequestData key!');
    }
    Object.assign(requestData, route.data.dropDownRequestData);
    return this.dropdownService.fetchOptions(requestData);
  }
}
