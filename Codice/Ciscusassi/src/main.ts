import { bootstrapApplication } from '@angular/platform-browser';
import {
	RouteReuseStrategy,
	provideRouter,
	withPreloading,
	PreloadAllModules,
} from '@angular/router';
import {
	IonicRouteStrategy,
	provideIonicAngular,
} from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { IonicStorageModule } from '@ionic/storage-angular';

import { authInterceptor } from './app/core/interceptors/auth.interceptor';

bootstrapApplication(AppComponent, {
	providers: [
		{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },

		// Carichiamo le classi di Ionic Angular
		provideIonicAngular(),

		// Carichiamo le rotte
		provideRouter(routes, withPreloading(PreloadAllModules)),

		// Iniettiamo il client HTTP per fare richieste al server, aggiungendo l'interceptor così possiamo intercettare eventuali errori
		provideHttpClient(withInterceptors([authInterceptor])),

		// Integriamo Ionic Storage per la gestione dello storage locale
		importProvidersFrom(IonicStorageModule.forRoot()),
	],
});
