import { ApplicationConfig } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';

/**
 * Configurazione dell'applicazione standalone (senza NgModule).
 * Qui si registrano i provider globali: router, HTTP client, animazioni, ecc.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
  ],
};
