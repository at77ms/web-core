import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() {}

  setItem(key: string, value: string): void {
    window.localStorage.setItem(key, value);
  }

  getItem(key: string): string {
    return window.localStorage.getItem(key);
  }

  removeItem(key: string): void {
    window.localStorage.removeItem(key);
  }

  findKeysByPrefix(prefix: string): string[] {
    const result: string[] = [];
    for (const key in localStorage) {
      if (key.indexOf(prefix) === 0) {
        result.push(key);
      }
    }
    return result;
  }
}
