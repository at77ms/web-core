import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import { TranslateLoader } from './translate-loader';

/**
 * This loader is just a placeholder that does nothing, in case you don't need a loader at all
 */
@Injectable({
  providedIn: 'root'
})
export class TranslateFakeLoader implements TranslateLoader {
  getJsonFileByPath(url: string): Observable<any> {
    return of({});
  }
  getMessageConfigOberables(lang: string): Observable<any>[] {
    return null;
  }
  getLabelConfigOberables(lang: string): Observable<any>[] {
    return null;
  }

  getFileByPath(path: string): Observable<any> {
    return of({});
  }
}
