import {Injectable} from '@angular/core';

export abstract class TranslateCompiler {
  abstract compile(value: string, lang: string): string;

  abstract compileTranslations(translations: any, lang: string): any;
}

/**
 * This compiler is just a placeholder that does nothing, in case you don't need a compiler at all
 */
@Injectable({
  providedIn: 'root'
})
export class TranslateFakeCompiler extends TranslateCompiler {
  compile(value: string, lang: string): string {
    return value;
  }

  compileTranslations(translations: any, lang: string): any {
    return translations;
  }
}
