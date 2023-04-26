import {HttpClient} from '@angular/common/http';
import {Observable, merge} from 'rxjs';
import {ResourceLoader} from './resource-loader';

export class ResourceHttpLoader implements ResourceLoader {
  constructor(private http: HttpClient, public prefix: any , public suffix: string = '.json') {}

  public getJsonFileByPath(url: string): Observable<object> {
    return this.http.get(`${url}${this.suffix}`);
  }
}
