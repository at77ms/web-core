import {Observable, of} from 'rxjs';

export abstract class ResourceLoader {
  abstract getJsonFileByPath(url: string): Observable<any>;
}
