import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { TranslateService } from '../translate/translate.service';
import { TranslateHttpLoader } from '../translate/translate-http-loader';
import { AppConfService } from './app-conf.service';
import { Logger } from '../logger/logger';
import { Observable } from 'rxjs';

@Injectable()
export class I18nService {

    supportedI18nLanguages: Array<string> = ['en', 'zh-hk', 'zh-cn'];
    defaultI18nLanguage = 'en';
    delimiter = '_';

    language = 'en';  // curent language which used to set http header in interceptor

    private readonly defaultTranslateLanguage = ''; // default language used in TranslateService

    constructor(private translateService: TranslateService, private logger: Logger, private appConfService: AppConfService) {
        this.logger.debug('......................... I18nService.constructor .........................');
        // this.init();
    }

    init() {
        this.logger.debug('......................... I18nService.init() .........................');

        const supportedI18nLanguages: Array<string> = this.appConfService.getValueByName('supportedI18nLanguages');
        if (supportedI18nLanguages) {
            this.supportedI18nLanguages = supportedI18nLanguages;
        }

        const tmpDefaultI18nLanguage: string = this.appConfService.getValueByName('defaultI18nLanguage');
        if (tmpDefaultI18nLanguage) {
            this.defaultI18nLanguage = tmpDefaultI18nLanguage;
        }
        this.language = this.defaultI18nLanguage;

        const i18nFileNameDelimiter: string = this.appConfService.getValueByName('i18nFileNameDelimiter');
        if (i18nFileNameDelimiter) {
            this.delimiter = i18nFileNameDelimiter;
        }

        this.loadLanguages(this.supportedI18nLanguages, this.defaultI18nLanguage, this.delimiter);
    }

    loadLanguages(langs: Array<string>, lang: string, limiter: string) {
        const that = this;
        const templangs = langs.map((val, index) => {
            return that.convert2TranslateLanguage(val);
        });
        this.translateService.addLangs(templangs);
        this.translateService.setDefaultLang(this.defaultTranslateLanguage);

        // set current language according to browser setting
        const browserCultureLang = this.translateService.getBrowserCultureLang().toLocaleLowerCase();
        this.logger.debug('I18nService.loadLanguages.browserLanguage', browserCultureLang);
        this.language = langs.indexOf(browserCultureLang) > -1 ? browserCultureLang : this.defaultI18nLanguage;
        this.translateService.use(this.convert2TranslateLanguage(this.language));
    }

    getMessage(messageKey: string): Observable<string> {
        return this.translateService.get(messageKey, null, 'message');
    }

    getLabel(labelKey: string): Observable<string> {
        return this.translateService.get(labelKey, null, 'label');
    }

    getLanguage() {
        return this.language;
    }

    setLanguage(lang: string) {
        this.language = lang;
        this.translateService.use(this.convert2TranslateLanguage(lang));
    }

    private convert2TranslateLanguage(lang: string) {
        if (lang === this.defaultI18nLanguage || lang === this.defaultTranslateLanguage) {
            return this.defaultTranslateLanguage;
        }
        return this.delimiter + lang;
    }
}
