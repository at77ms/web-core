import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {isPlatformBrowser} from '@angular/common';
import {LoggerLevel} from './types/logger-level.enum';
import {LoggerConfig} from './logger.config';
import {LoggerConfigEngine} from './logger-config.engine';
import {LoggerUtils} from './utils/logger-utils';
import {HttpMetaDataInterface} from './types/http-meta-data.interface';

export const Levels = [
  'TRACE',
  'DEBUG',
  'INFO',
  'LOG',
  'WARN',
  'ERROR',
  'OFF'
];

@Injectable({
  providedIn: 'root'
})
export class Logger {
  private readonly isIE: boolean;
  private readonly logFunc: ((level: LoggerLevel, metaString: string, message: string, additional: any[]) => void);
  private configService: LoggerConfigEngine;

  constructor(loggerConfig: LoggerConfig,
              @Inject(PLATFORM_ID) private readonly platformId) {
    this.isIE = isPlatformBrowser(platformId) &&
      !!(navigator.userAgent.indexOf('MSIE') !== -1 || navigator.userAgent.match(/Trident\//) || navigator.userAgent.match(/Edge\//));

    // each instance of the logger should have their own config engine
    this.configService = new LoggerConfigEngine(loggerConfig);

    this.logFunc = this.isIE ? this._logIE.bind(this) : this._logModern.bind(this);

  }

  public trace(message, ...additional: any[]): void {
    this._log(LoggerLevel.TRACE, message, additional);
  }

  public debug(message, ...additional: any[]): void {
    this._log(LoggerLevel.DEBUG, message, additional);
  }

  public info(message, ...additional: any[]): void {
    this._log(LoggerLevel.INFO, message, additional);
  }

  public log(message, ...additional: any[]): void {
    this._log(LoggerLevel.LOG, message, additional);
  }

  public warn(message, ...additional: any[]): void {
    this._log(LoggerLevel.WARN, message, additional);
  }

  public error(message, ...additional: any[]): void {
    this._log(LoggerLevel.ERROR, message, additional);
  }

  public updateConfig(config: LoggerConfig) {
    this.configService.updateConfig(config);
  }

  public getConfigSnapshot(): LoggerConfig {
    return this.configService.getConfig();
  }

  private _logIE(level: LoggerLevel, metaString: string, message: string, additional: any[]): void {

    // Coloring doesn't work in IE
    // make sure additional isn't null or undefined so that ...additional doesn't error
    additional = additional || [];

    switch (level) {
      case LoggerLevel.WARN:
        console.warn(`${metaString} `, message, ...additional);
        break;
      case LoggerLevel.ERROR:
        console.error(`${metaString} `, message, ...additional);
        break;
      case LoggerLevel.INFO:
        // tslint:disable-next-line:no-console
        console.info(`${metaString} `, message, ...additional);
        break;
      default:
        console.log(`${metaString} `, message, ...additional);
    }
  }

  private _logModern(level: LoggerLevel, metaString: string, message: string, additional: any[]): void {

    const color = LoggerUtils.getColor(level);

    // make sure additional isn't null or undefined so that ...additional doesn't error
    additional = additional || [];

    switch (level) {
      case LoggerLevel.WARN:
        console.warn(`%c${metaString}`, `color:${color}`, message, ...additional);
        break;
      case LoggerLevel.ERROR:
        console.error(`%c${metaString}`, `color:${color}`, message, ...additional);
        break;
      case LoggerLevel.INFO:
        // tslint:disable-next-line:no-console
        console.info(`%c${metaString}`, `color:${color}`, message, ...additional);
        break;
      case LoggerLevel.TRACE:
        // tslint:disable-next-line:no-console
        console.trace(`%c${metaString}`, `color:${color}`, message, ...additional);
        break;
      case LoggerLevel.DEBUG:
        // tslint:disable-next-line:no-console
        console.debug(`%c${metaString}`, `color:${color}`, message, ...additional);
        break;
      default:
        console.log(`%c${metaString}`, `color:${color}`, message, ...additional);
    }
  }

  private _log(level: LoggerLevel, message, additional: any[] = []): void {
    const config = this.configService.getConfig();
    const isLog2Console = !(level < config.level);
    if (!(message && (isLog2Console))) {
      return;
    }

    const logLevelString = Levels[level];

    message = LoggerUtils.prepareMessage(message);

    // only use validated parameters for HTTP requests
    const validatedAdditionalParameters = LoggerUtils.prepareAdditionalParameters(additional);
    const timestamp = new Date().toISOString();
    const callerDetails = LoggerUtils.getCallerDetails();

    // if no message or the log level is less than the environ
    if (isLog2Console) {
      const metaString = LoggerUtils.prepareMetaString(timestamp, logLevelString, callerDetails.fileName, callerDetails.lineNumber);
      return this.logFunc(level, metaString, message, additional);
    }

  }
}
