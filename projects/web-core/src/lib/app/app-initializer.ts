import { Provider, APP_INITIALIZER } from '@angular/core';
import { EnvironmentService } from '../service/environment.service';
import { AppConfService } from '../service/app-conf.service';
import { Logger } from '../logger/logger';
import { ValidationConfService } from '../validation/validation-conf.service';
import { AuthenticationService } from '../auth/service/authentication.service';
import { I18nService } from '../service/i18n.service';

export function initEnvironmentService(
    environmentService: EnvironmentService,
    envObj: object,
    envConfUrls: string,
    logger: Logger
): Promise<any>[] {
    logger.debug('---------------Environment configuration URLs: ', envConfUrls);
    if (!envConfUrls) {
        throw new Error('Environment configuration URLs are not pre-defined');
    }

    let envConfUrlArr: string[];
    try {
        envConfUrlArr = JSON.parse(envConfUrls);
    } catch (error) {
        throw new Error('Environment configuration URLs are pre-defined wrongly');
    }
    logger.debug('---------------Environment configuration URLs parsed: ', envConfUrlArr);

    if (!envConfUrlArr || envConfUrlArr.length === 0) {
        throw new Error('Environment configuration URLs are not pre-defined');
    }

    // load environment configuration
    environmentService.setEnvObj(envObj);
    const promiseArr = [];
    let promise = environmentService.loadEnvConf(envConfUrlArr[0]);
    promiseArr.push(promise);
    for (let i = 1; i < envConfUrlArr.length; i++) {
        promise = promise.then((data) => environmentService.loadEnvConf(envConfUrlArr[i]));
        promiseArr.push(promise);
    }
    return promiseArr;
}

// get configuration and init application context
export function initAppConfService(
    appConfService: AppConfService,
    confUrls: string,
    logger: Logger,
): Promise<any>[] {
    logger.debug('---------------application configuration1: ', confUrls);
    if (!confUrls) {
        throw new Error('Configuration URL is not pre-defined');
    }

    let confUrlArr: string[];
    try {
        confUrlArr = JSON.parse(confUrls);
    } catch (error) {
        throw new Error('Configuration URL is pre-defined wrongly');
    }
    logger.debug('---------------application configuration2: ', confUrlArr);

    if (!confUrlArr || confUrlArr.length === 0) {
        throw new Error('Configuration URL is not pre-defined');
    }

    // load application configuration
    const promiseArr = [];
    let promise = appConfService.loadConf(confUrlArr[0]);
    promiseArr.push(promise);
    for (let i = 1; i < confUrlArr.length; i++) {
        promise = promise.then((data) => appConfService.loadConf(confUrlArr[i]));
        promiseArr.push(promise);
    }

    return promiseArr;
}

// get configuration and init application context
export function initApplicationContext(
    environmentService: EnvironmentService,
    envObj: object,
    envConfUrls: string,
    appConfService: AppConfService,
    confUrls: string,
    logger: Logger,
    i18nService: I18nService,
    authenticationService: AuthenticationService
) {
    return () => {
        const initEnvConfSvcPromiseArr = initEnvironmentService(environmentService, envObj, envConfUrls, logger);
        const initAppConfSvcPromiseArr = initAppConfService(appConfService, confUrls, logger);

        const promise = Promise.all([...initEnvConfSvcPromiseArr, ...initAppConfSvcPromiseArr]).then((data) => {
            logger.debug('Initialize I18N context ..............');
            i18nService.init();
            logger.debug('Initialize authentication context ..............');
            authenticationService.init();
        });
        return promise;
    };
}

export function getValidationConf(validationConfService: ValidationConfService, confUrl: string) {
    return () => validationConfService.loadConf(confUrl);
}

/** App initializer providers in outside-in order */
export const appInitializerProvider: Provider[] = [
    {
        provide: APP_INITIALIZER,
        useFactory: initApplicationContext,
        deps: [
            EnvironmentService, 'environment', 'envConfUrls',
            AppConfService, 'appConfUrls', Logger,
            I18nService, AuthenticationService
        ],
        multi: true
    },
    {
        provide: APP_INITIALIZER,
        useFactory: getValidationConf,
        deps: [ValidationConfService, 'validationConfUrl'],
        multi: true
    },
];

