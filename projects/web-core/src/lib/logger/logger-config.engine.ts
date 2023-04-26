import {LoggerConfig} from './logger.config';

export class LoggerConfigEngine {

  private logConfig;
  constructor(readonly config: LoggerConfig) {
    this.logConfig = config;
  }
  updateConfig(config: LoggerConfig) {
    this.logConfig = this._clone(config);
  }
  getConfig() {
    return this._clone(this.logConfig);
  }


  // TODO: add tests around cloning the config. updating an object passed into the config (or retrieving from the config)
  // should not update the active config
  private _clone(object: any) {
    const cloneConfig: LoggerConfig = new LoggerConfig();

    Object.keys(object).forEach((key) => {
      cloneConfig[key] = object[key];
    });

    return cloneConfig;
  }
}
