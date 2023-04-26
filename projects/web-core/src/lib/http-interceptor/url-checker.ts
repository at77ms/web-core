import { HttpRequest, HttpHeaders } from '@angular/common/http';
import { EnvironmentService } from '../service';

export function addNotShowLoadingOption() {
    return {headers: new HttpHeaders({'Dont-Show-Loading': 'Y'})};
}

export function isBackendRequest(request: HttpRequest<any>): boolean {
    if (request && request.url) {
        const baseUrlInfo = EnvironmentService.getInstance().getApiBaseUrlInfo(request.url);
        if (baseUrlInfo && baseUrlInfo.httpInterceptor && baseUrlInfo.httpInterceptor === 'xgfe_http_interceptor') {
            return true;
        }
    }
    return false;
}

export function isBackendResponse(response: any): boolean {
    if (response && response.url) {
        const baseUrlInfo = EnvironmentService.getInstance().getApiBaseUrlInfo(response.url);
        if (baseUrlInfo && baseUrlInfo.httpInterceptor && baseUrlInfo.httpInterceptor === 'xgfe_http_interceptor') {
            return true;
        }
    }
    return false;
}

export function isFrontendFileResponse(response: any): boolean {
    if (response && response.url) {
        const el = document.createElement('a');
        el.href = response.url;
        if (location.hostname === el.hostname) {
            return true;
        }
    }
    return false;
}

export function isAddXAppHeader(request: HttpRequest<any>): boolean {
    if (request && request.url) {
        const baseUrlInfo = EnvironmentService.getInstance().getApiBaseUrlInfo(request.url);
        if (baseUrlInfo && baseUrlInfo.httpInterceptor === 'xgfe_http_interceptor' && baseUrlInfo.addXAppHeader === false) {
            return false;
        }
    }
    return true;
}

export function isAddHeader(request: HttpRequest<any>, headerKey: string): boolean {
    if (request && request.url) {
        const baseUrlInfo = EnvironmentService.getInstance().getApiBaseUrlInfo(request.url);
        if (baseUrlInfo && baseUrlInfo.httpInterceptor === 'xgfe_http_interceptor' && baseUrlInfo[headerKey] === false) {
            return false;
        }
    }
    return true;
}

export function isBaseApiEnabledEncryption(request: HttpRequest<any>): boolean | null {
    if (request && request.url) {
        const baseUrlInfo = EnvironmentService.getInstance().getApiBaseUrlInfo(request.url);
        if (baseUrlInfo && baseUrlInfo.httpInterceptor === 'xgfe_http_interceptor') {
            if (baseUrlInfo.end2EndEncryptionEnabled === true) {
                return true;
            } else if (baseUrlInfo.end2EndEncryptionEnabled === false) {
                return false;
            } else { return null; }
        }
    }
}
