import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AppConfService } from './app-conf.service';
import { EnvironmentService } from './environment.service';

export interface SqlParam {
  isInCondition: boolean;
  paramName: string;
  paramValues: string[];
}
@Injectable({
  providedIn: 'root'
})
export class LookupTableService {
  private requestUrl = this.envService.getApiBaseUrl('xgfe-base', true) + '/lookup/query';
  private observableMap: Map<string, Observable<object[]>> = new Map();
  constructor(private appConfService: AppConfService, private http: HttpClient, private envService: EnvironmentService) { }

  /**
   * get the autoComplete or dropdown componet options, by default it will cache the http respones cache data, so if the request
   * have the same 'lookupCode', 'sqlParams' and the 'appCode' it will not request the backend when the second request trigger.
   * @param lookupCode choose which lookconfig to use, to see all the look config 'SELECT * FROM [dbo].[lookup_conf]'
   * @param sqlParams the query params use in the lookup config sql
   * @param requestFromBackEndForce request the data from backend or not
   * by default it is 'false', it will use the http respones cache data if there is;
   * when it is 'true' it will request the back end to get data;
   * when it is 'noCache' this request will no cache the http respones data.
   * @param appCode the application code, by default it will use the config file applicationId or the environment file applicationId
   */
  getOption(lookupCode: string, sqlParams: SqlParam[], requestFromBackEndForce: boolean|'noCache' = false,
            appCode = this.appConfService.getApplicationId() || EnvironmentService.getInstance().getApplicationId()) {
    if (requestFromBackEndForce === 'noCache') {
      return this.requestOption(lookupCode, sqlParams, appCode, requestFromBackEndForce);
    } else {
      const queryStr = JSON.stringify({lookupCode, sqlParams, appCode});
      if (requestFromBackEndForce || !this.observableMap.get(queryStr)) {
        this.observableMap.set(queryStr, this.requestOption(lookupCode, sqlParams, appCode, requestFromBackEndForce).pipe(shareReplay(1)));
      }
      return this.observableMap.get(queryStr);
    }
  }

  private requestOption(lookupCode: string, sqlParams: SqlParam[], appCode: string, requestFromBackEndForce: boolean|'noCache') {
    const queryStr = JSON.stringify({lookupCode, sqlParams, appCode});
    return this.http.post(this.requestUrl, {appCode, lookupCode, sqlParams})
               .pipe(map((response: any) => {
                  if (response && response.data) {
                    if (requestFromBackEndForce !== 'noCache') {
                      this.observableMap.set(queryStr, of(response.data));
                    }
                    return response.data;
                  } else {
                    return null;
                  }
              }));
  }

  /**
   * clear all the cache http respones cache data
   */
  clearCache() {
    this.observableMap.clear();
  }
}
