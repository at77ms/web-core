import {Observable, of} from 'rxjs';

export abstract class TranslateLoader {
  abstract getMessageConfigOberables(lang: string): Observable<any>[];
  abstract getLabelConfigOberables(lang: string): Observable<any>[];

}
