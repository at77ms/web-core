import {LoggerLevel} from './logger-level.enum';

export class HttpMetaDataInterface {
  level: LoggerLevel;
  timestamp: string;
  fileName: string;
  lineNumber: string;
}
