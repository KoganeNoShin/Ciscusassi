// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// src/environments/environment.ts
export const environment = {
	production: false,
	tomtomApiKey: 'LA_TUA_API_KEY_TOMTOM',
	apiURL: 'http://localhost:4200',
	CORS_ORIGIN: 'http://localhost:8100',
	JWT_SECRET_KEY: 'PASSWORD DEL TOKEN',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
