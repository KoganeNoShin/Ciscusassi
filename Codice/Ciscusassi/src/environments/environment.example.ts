// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// src/environments/environment.ts
export const environment = {
	production: false,
	tomtomApiKey: 'LA_TUA_API_KEY_TOMTOM', // API_KEY di TOMTOM per le mappe
	apiURL: 'http://localhost:3000', // L'endpoint base del server express
	JWT_SECRET_KEY: 'PASSWORD DEL TOKEN', // La password JWT che deve essere uguale nel backend
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
