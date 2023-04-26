import { Provider } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { ErrorHandlingInterceptor } from './error-handling-interceptor';
import { LoaderInterceptor } from './loader-interceptor';
import { HeaderInterceptor } from './header-interceptor';
import { SecurityInterceptor } from './security-interceptor';
import { BodyInterceptor } from './body-interceptor';
import { TimeoutInterceptor } from './timeout-interceptor';
import { AssetInterceptor } from './asset-interceptor';

/** Http interceptor providers in outside-in order */
export const httpInterceptorProviders: Provider[] = [
  { provide: HTTP_INTERCEPTORS, useClass: ErrorHandlingInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: HeaderInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: SecurityInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: BodyInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: TimeoutInterceptor, multi: true },

  { provide: HTTP_INTERCEPTORS, useClass: AssetInterceptor, multi: true },




];
