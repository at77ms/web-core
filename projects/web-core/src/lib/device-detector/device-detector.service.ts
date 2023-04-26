import { PLATFORM_ID, Inject, Injectable } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as Constants from './device-detector.constants';
import { DeviceInfo } from './device-info';
import { ReTree } from './retree';

@Injectable({
    providedIn: 'root'
})
export class DeviceDetectorService {
    ua = '';
    userAgent = '';
    os = '';
    browser = '';
    device = '';
    private osVersion = '';
    private browserVersion = '';

    constructor(@Inject(PLATFORM_ID) private platformId) {
        if (isPlatformBrowser(this.platformId)) {
            this.ua = window.navigator.userAgent;
        }
        this.initDeviceInfo();
    }

    /**
     * @desc Sets the initial value of the device when the service is initiated.
     * This value is later accessible for usage
     */
    private initDeviceInfo() {
        const reTree = new ReTree();
        const ua = this.ua;
        this.userAgent = ua;
        const mappings = [
            { const : 'OS' , prop: 'os'},
            { const : 'BROWSERS' , prop: 'browser'},
            { const : 'DEVICES' , prop: 'device'},
            { const : 'OS_VERSIONS' , prop: 'os_version'},
        ];

        mappings.forEach((mapping) => {
            this[mapping.prop] = Object.keys(Constants[mapping.const]).reduce((obj: any, item: any) => {
                obj[Constants[mapping.const][item]] = reTree.test(ua, Constants[`${mapping.const}_RE`][item]);
                return obj;
            }, {});
        });

        mappings.forEach((mapping) => {
            this[mapping.prop] = Object.keys(Constants[mapping.const])
            .map((key) => {
                return Constants[mapping.const][key];
            }).reduce((previousValue, currentValue) => {
                return (previousValue === Constants[mapping.const].UNKNOWN && this[mapping.prop][currentValue])
                        ? currentValue : previousValue;
            }, Constants[mapping.const].UNKNOWN);
        });

        this.browserVersion = '0';
        if (this.browser !== Constants.BROWSERS.UNKNOWN) {
            const re = Constants.BROWSER_VERSIONS_RE[this.browser];
            const res = reTree.exec(ua, re);
            if (!!res) {
                this.browserVersion = res[1];
            }
        }
    }

    /**
     * @desc Returns the device information
     * @returns the device information object.
     */
    public getDeviceInfo(): DeviceInfo {
        const deviceInfo: DeviceInfo = {
            userAgent: this.userAgent,
            os : this.os,
            browser: this.browser,
            device : this.device,
            os_version: this.osVersion,
            browser_version: this.browserVersion
        };
        return deviceInfo;
    }

    /**
     * @desc Compares the current device info with the mobile devices to check
     * if the current device is a mobile.
     * @returns whether the current device is a mobile
     */
    public isMobile(): boolean {
        return [
            Constants.DEVICES.ANDROID,
            Constants.DEVICES.IPHONE,
            Constants.DEVICES.I_POD,
            Constants.DEVICES.BLACKBERRY,
            Constants.DEVICES.FIREFOX_OS,
            Constants.DEVICES.WINDOWS_PHONE,
            Constants.DEVICES.VITA
        ].some((item) => {
            return this.device === item;
        });
    }

    /**
     * @desc Compares the current device info with the tablet devices to check
     * if the current device is a tablet.
     * @returns whether the current device is a tablet
     */
    public isTablet() {
        return [
            Constants.DEVICES.I_PAD,
            Constants.DEVICES.FIREFOX_OS
        ].some((item) => {
            return this.device === item;
        });
    }

    /**
     * @desc Compares the current device info with the desktop devices to check
     * if the current device is a desktop device.
     * @returns whether the current device is a desktop device
     */
    public isDesktop() {
        return [
            Constants.DEVICES.PS4,
            Constants.DEVICES.CHROME_BOOK,
            Constants.DEVICES.UNKNOWN
        ].some((item) => {
            return this.device === item;
        });
    }
}
