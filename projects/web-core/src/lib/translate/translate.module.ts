import {NgModule, ModuleWithProviders, Provider} from '@angular/core';
import {TranslateService} from './translate.service';
import {MissingTranslationHandler, FakeMissingTranslationHandler} from './missing-translation-handler';
import {TranslateParser, TranslateDefaultParser} from './translate.parser';
import {TranslateCompiler, TranslateFakeCompiler} from './translate.compiler';
import {TranslateDirective} from './translate.directive';
import {MessagePipe} from './message.pipe';
import {TranslateStore} from './translate.store';
import {USE_STORE} from './translate.service';
import {USE_DEFAULT_LANG} from './translate.service';
import { LabelPipe } from './label.pipe';
import { TranslateFakeLoader } from './translate-fake.loader';
import { TranslateLoader } from './translate-loader';

export interface TranslateModuleConfig {
  loader?: Provider;
  compiler?: Provider;
  parser?: Provider;
  missingTranslationHandler?: Provider;
  // isolate the service instance, only works for lazy loaded modules or components with the "providers" property
  isolate?: boolean;
  useDefaultLang?: boolean;
}

@NgModule({
  declarations: [
    MessagePipe,
    LabelPipe,
    TranslateDirective,
  ],
  exports: [
    MessagePipe,
    LabelPipe,
    TranslateDirective,
  ]
})
export class TranslateModule {
  /**
   * Use this method in your root module to provide the TranslateService
   */
  static forRoot(config: TranslateModuleConfig = {}): ModuleWithProviders {
    return {
      ngModule: TranslateModule,
      providers: [
        config.loader || {provide: TranslateLoader, useClass: TranslateFakeLoader},
        config.compiler || {provide: TranslateCompiler, useClass: TranslateFakeCompiler},
        config.parser || {provide: TranslateParser, useClass: TranslateDefaultParser},
        config.missingTranslationHandler || {provide: MissingTranslationHandler, useClass: FakeMissingTranslationHandler},
        TranslateStore,
        {provide: USE_STORE, useValue: config.isolate},
        {provide: USE_DEFAULT_LANG, useValue: config.useDefaultLang},
        TranslateService
      ]
    };
  }

  /**
   * Use this method in your other (non root) modules to import the directive/pipe
   */
  static forChild(config: TranslateModuleConfig = {}): ModuleWithProviders {
    return {
      ngModule: TranslateModule,
      providers: [
        config.loader || {provide: TranslateLoader, useClass: TranslateFakeLoader},
        config.compiler || {provide: TranslateCompiler, useClass: TranslateFakeCompiler},
        config.parser || {provide: TranslateParser, useClass: TranslateDefaultParser},
        config.missingTranslationHandler || {provide: MissingTranslationHandler, useClass: FakeMissingTranslationHandler},
        {provide: USE_STORE, useValue: config.isolate},
        {provide: USE_DEFAULT_LANG, useValue: config.useDefaultLang},
        TranslateService
      ]
    };
  }
}
