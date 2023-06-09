import {Injectable} from '@angular/core';
import {isDefined} from './util';

export abstract class TranslateParser {
  /**
   * Interpolates a string to replace parameters
   * "This is a {{ key }}" ==> "This is a value", with params = { key: "value" }
   * @param expr Interpolates a string to replace parameters
   * @param params an { key: "value" }
   */
  // tslint:disable-next-line: ban-types
  abstract interpolate(expr: string | Function, params?: any): string;

  /**
   * Gets a value from an object by composed key
   * parser.getValue({ key1: { keyA: 'valueI' }}, 'key1.keyA') ==> 'valueI'
   * @param target the target
   * @param key the key
   */
  abstract getValue(target: any, key: string): any;
}

@Injectable({
  providedIn: 'root'
})
export class TranslateDefaultParser extends TranslateParser {
  templateMatcher: RegExp = /{{\s?([^{}\s]*)\s?}}/g;

  // tslint:disable-next-line: ban-types
  public interpolate(expr: string | Function, params?: any): string {
    let result: string;

    if (typeof expr === 'string') {
      result = this.interpolateString(expr, params);
    } else if (typeof expr === 'function') {
      result = this.interpolateFunction(expr, params);
    } else {
      // this should not happen, but an unrelated TranslateService test depends on it
      result = expr as string;
    }

    return result;
  }

  getValue(target: any, key: string): any {
    const keys = key.split('.');
    key = '';
    do {
      key += keys.shift();
      if (isDefined(target) && isDefined(target[key]) && (typeof target[key] === 'object' || !keys.length)) {
        target = target[key];
        key = '';
      } else if (!keys.length) {
        target = undefined;
      } else {
        key += '.';
      }
    } while (keys.length);

    return target;
  }

  // tslint:disable-next-line: ban-types
  private interpolateFunction(fn: Function, params?: any) {
    return fn(params);
  }

  private interpolateString(expr: string, params?: any) {
    if (!params) {
      return expr;
    }

    return expr.replace(this.templateMatcher, (substring: string, b: string) => {
      const r = this.getValue(params, b);
      return isDefined(r) ? r : substring;
    });
  }
}
