import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Logger } from '../logger/logger';

export interface SSOSetting {
  response_type: string;
  response_mode: string;
  scope: string;
  tenant: string;
  client_id: string;
  redirect_uri: string;
  fakeTokenTimeOut?: number;
}

export interface OKTASetting {
  OKTABaseUrl: string;
  client_id: string;
  redirect_uri: string;
  state: string;
  response_type: string;
  grant_type: string;
  scope: string;
  fakeTokenTimeOut?: number;
}
export interface ProofKey {
  code_verifier: string;
  code_challenge: string;
}

export interface  ApiBaseUrls {
  name: string;
  baseUrl: string;
  httpInterceptor: string;
  addXAppHeader?: boolean;
  addXAuth?: boolean;
  addXSourceApp?: boolean;
  addXForwardedFor?: boolean;
  addXAiaOriginatingUserId?: boolean;
  end2EndEncryptionEnabled?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  private static instance: EnvironmentService = null;

  private envObj: any;
  private envVarMap: Map<string, string|boolean|any[]|object> = new Map<string, string|boolean|any[]|object>();

  static getInstance(): EnvironmentService {
    return EnvironmentService.instance;
  }

  constructor(private http: HttpClient, private logger: Logger) {
    EnvironmentService.instance = this;
  }

  setEnvObj(envObj: object) {
    this.logger.debug('EnvironmentService.envObj', envObj);
    this.envObj = envObj;
  }

  loadEnvConf(envConfUrl: string): Promise<any> {
    if (!envConfUrl) {
      return ;
    }

    const promise = this.http.get(envConfUrl).toPromise().then(
      data => {
        this.logger.debug(`Environment configuration data of env conf file - ${envConfUrl}:`, data);
        if (data) {
          for (const key in data) {
            if (data.hasOwnProperty(key)) {
              this.envVarMap.set(key, data[key]);
            }
          }
        }
        this.logger.debug(`Current environment configurations after loading ${envConfUrl}:`, this.envVarMap);
      }
    );
    return promise;
  }

  // Environment Object
  isProduction(): boolean {
    return this.envObj.production;
  }

  getCurrentEnv(): string {
    return this.envObj.env;
  }

  getApplicationId(): string {
    return this.envObj.applicationId as string;
  }
  getAppSocketId(): string {
    return this.envObj.getAppSocketId as string;
  }

  getAssetBaseUrls(): string[] {
    return [this.envObj.commonAssetBaseUrl, this.envObj.applicationAssetBaseUrl] as string[];
  }

  // Configured environment variables - 5
  isEnd2EndEncryptionEnabled(): boolean {
    return this.getValueAsBoolean('end2EndEncryptionEnabled', true);
  }

  private getCommonApiBaseUrls(): any[] {
    return this.getValueAsArray('commonApiBaseUrls');
  }

  private getAppApiBaseUrls(): any[] {
    return this.getValueAsArray('apiBaseUrls');
  }

  private findBaseUrlByName(name: string, baseUrlObjs: any[]): string {
    if (!name || !baseUrlObjs || baseUrlObjs.length === 0) {
      return '';
    }

    for (const baseUrlObj of baseUrlObjs) {
      if (baseUrlObj.name === name) {
        return baseUrlObj.baseUrl;
      }
    }

    return '';
  }

  getApiBaseUrl(name: string, isCommonApi: boolean = false): string {
    // for common API
    if (isCommonApi) {
      return this.findBaseUrlByName(name, this.getCommonApiBaseUrls());
    }

    // for application API
    return this.findBaseUrlByName(name, this.getAppApiBaseUrls());
  }

  private findBaseUrlInfoByUrl(apiUrl: string, baseUrlObjs: any[]): ApiBaseUrls {
    if (!apiUrl || !baseUrlObjs || baseUrlObjs.length === 0) {
      return null;
    }

    for (const baseUrlObj of baseUrlObjs) {
      if (apiUrl.includes(baseUrlObj.baseUrl)) {
        // this.logger.debug('EnvironmentService.findBaseUrlInfoByUrl.baseUrlObj', baseUrlObj);
        return baseUrlObj;
      }
    }

    return null;
  }

  getApiBaseUrlInfo(apiUrl: string): ApiBaseUrls {
    // application API
    const baseUrlObj = this.findBaseUrlInfoByUrl(apiUrl, this.getAppApiBaseUrls());
    if (baseUrlObj) {
      return baseUrlObj;
    }

    // common API
    return this.findBaseUrlInfoByUrl(apiUrl, this.getCommonApiBaseUrls());
  }

  getValueAsBoolean(key: string, defaultValue: boolean = false): boolean {
    const value = this.getEnvironmentVariableValue(key, defaultValue);
    return value as boolean;
  }

  getValueAsString(key: string, defaultValue: string = ''): string {
    const value = this.getEnvironmentVariableValue(key, defaultValue);
    return value as string;
  }
  getValueAsNumber(key: string, defaultValue: number = 0): number {
    const value = this.getEnvironmentVariableValue(key, defaultValue);
    return value as number;
  }

  getValueAsArray(key: string, defaultValue: any[] = null): any[] {
    const value = this.getEnvironmentVariableValue(key, defaultValue);
    return value as any[];
  }

  getValueAsObject(key: string, defaultValue: object = null): any {
    const value = this.getEnvironmentVariableValue(key, defaultValue);
    return value;
  }

  private getEnvironmentVariableValue(
    key: string, defaultValue: string | number | boolean | any[] | object = null): string | number | boolean | any[] | object {
    const value = this.envVarMap.get(key);
    if (value === undefined || value == null) {
      return defaultValue;
    }
    return value;
  }

}
