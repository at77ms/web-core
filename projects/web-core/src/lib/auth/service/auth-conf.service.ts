import { Injectable } from '@angular/core';
import { AppConfService } from '../../service/app-conf.service';
import { EnvironmentService, OKTASetting, SSOSetting } from '../../service/environment.service';
import { Subject } from 'rxjs';

export interface StateObj {
    action: string;
    state: string;
    code_verifier: string;
}
@Injectable({
    providedIn: 'root'
})
export class AuthConfService {
    private readonly defaultRefreshIntervalBeforeExpired: number = 300; // 5 minutes
    private readonly defaultSilentRefreshIntervalBeforeExpired: number = 900; // 15 minutes
    private readonly defaultPromptBeforeIdle: number = 300; // 5 minutes
    idleMonitorSbuject: Subject<boolean> = new Subject();
    readonly refreshStateTxt: string = 'refreshSSOToken';
    readonly popupGetNewTokenStateTxt: string = 'popupGetNewTokenState';
    readonly sclientRefreshTokenStateTxt: string = 'sclientRefreshTokenStateTxt';
    readonly manualLogoutByUser: string = 'manualLogoutByUser';
    readonly logoutBySessionExpired: string = 'logoutBySessionExpired';

    constructor(private appConfService: AppConfService, private environmentService: EnvironmentService
    ) {}

    getOKTASetting(): OKTASetting {
        return this.environmentService.getValueAsObject('oktaSettings') as OKTASetting;
    }
    getTokenDataKeyPrefix(): string {
        return this.appConfService.getValueByName('tokenDataKeyPrefix');
    }
    // unit: second
    getTokenRefreshIntervalBeforeExpired(): number {
        const tokenRefreshIntervalBeforeExpired = this.appConfService.getValueByName('tokenRefreshIntervalBeforeExpired');
        if ( ! tokenRefreshIntervalBeforeExpired) {
            return this.defaultRefreshIntervalBeforeExpired;
        }
        return tokenRefreshIntervalBeforeExpired as number;
    }
    // unit: second
    getSilentfreshTokenReIntervalBeforeExpired(): number {
        const silentTokenRefreshIntervalBeforeExpired = this.appConfService.getValueByName('silentRefreshTokenIntervalBeforeExpired');
        if ( ! silentTokenRefreshIntervalBeforeExpired) {
            return this.defaultSilentRefreshIntervalBeforeExpired;
        }
        return silentTokenRefreshIntervalBeforeExpired as number;
    }
    // unit: second
    getPromptBeforeIdle(): number {
        const PromptBeforeIdle = this.appConfService.getValueByName('promptBeforeIdle');
        if ( ! PromptBeforeIdle) {
            return this.defaultPromptBeforeIdle;
        }
        return PromptBeforeIdle as number;
    }
    isRefreshTokenWindow(): boolean {
        const state = this.getParameterByName('state');
        if (state && this.parseStateObj(state).action === this.refreshStateTxt) {
            return true;
        }
        return false;
    }
    isPopupGetNewTokenWindow(): boolean {
        const state = this.getParameterByName('state');
        if (state && this.parseStateObj(state).action === this.popupGetNewTokenStateTxt) {
            return true;
        }
        return false;
    }
    isSclientRefreshTokenWindow(): boolean {
        const state = this.getParameterByName('state');
        if (state && this.parseStateObj(state).action === this.sclientRefreshTokenStateTxt) {
            return true;
        }
        return false;
    }
    isBypassLogin(): boolean {
        return this.environmentService.getValueAsBoolean('bypassLogin', false) ||
            this.isRefreshTokenWindow() || this.isPopupGetNewTokenWindow();
    }
    getDummyUserProfile(): any {
        const dummyUserProfile = {
            userId: 'xxxxxxx', userName: 'dummyUser Name', email: 'dummy.email@aia.com',
            hkid: 'dummy Hkid', operation: 'dummy Operation', team: 'dummy Team', userDesk: 'dummmy UserDesk',
            infoAuthority: 'dummy InfoAuthority', lateam: 'dummy Lateam', usrPrincipalNm: 'dummy.email@aia.com'
        };
        const appSettingUserProfile = this.environmentService.getValueAsObject('dummyUserProfile');
        if (appSettingUserProfile && typeof appSettingUserProfile === 'object') {
            Object.assign(dummyUserProfile, appSettingUserProfile);
        }
        return dummyUserProfile;
    }
    getParameterByName(name, url = window.location.href) {
        name = name.replace(/[\[\]]/g, '\\$&');
        const regex = new RegExp('[#?&]' + name + '(=([^&#]*)|&|#|$)');
        const results = regex.exec(url);
        if (!results) { return null; }
        if (!results[2]) { return ''; }
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }
    parseStateObj(state: string): StateObj {
        try {
        return JSON.parse(atob(state));
        } catch (e) {console.log(e); }
    }
}
