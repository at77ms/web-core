import {HttpClient} from '@angular/common/http';
import {Observable, merge} from 'rxjs';
import {TranslateLoader} from '../translate/translate-loader';
import { AppConfService } from '../service';

export class TranslateHttpLoader implements TranslateLoader {
  constructor(private http: HttpClient, public prefix: any , public suffix: string) {}

  /**
   * Gets the translations file from the server
   */
  public getMessageConfigOberables(lang: string): Observable<object>[] {
    const msgOberables = [];
    if (this.prefix.hasOwnProperty('message')) {
      const len = this.prefix.message.length;
      for (let i = 0; i < len; i++) {
        msgOberables.push(this.http.get(`${this.prefix.message[i]}${lang}${this.suffix}`));
      }
      return msgOberables;
    }
    return null;
  }

  public getLabelConfigOberables(lang: string): Observable<object>[] {
    const labelOberables = [];
    if (this.prefix.hasOwnProperty('label')) {
      const len = this.prefix.label.length;
      for (let i = 0; i < len; i++) {
        labelOberables.push(this.http.get(`${this.prefix.label[i]}${lang}${this.suffix}`));
      }
      return labelOberables;
    }
    return null;
  }
}

export interface MapPrefix {
  message?: any;
  label?: any;
}
export function createTranslateHttpLoader(http: HttpClient, prefix: string, suffix: string) {
  const mapPrefix: MapPrefix = {};
  const jsonPrefix = JSON.parse(prefix);
  if (jsonPrefix.hasOwnProperty('message')) {
    mapPrefix.message = jsonPrefix.message;
  }
  if (jsonPrefix.hasOwnProperty('label')) {
    mapPrefix.label = jsonPrefix.label;
  }
  return new TranslateHttpLoader(http, mapPrefix, suffix);
}
