import { Routes } from '@angular/router';
import { authGuard } from '../guards/auth.guard';

export const prenotazioniRoutes: Routes = [
	{
		path: 'prenota',
		loadComponent: () =>
			import('../../pages/prenotazioni/prenota/prenota.page').then(
				(m) => m.PrenotaPage
			),
		canActivate: [authGuard(['cliente'])],
	},
	{
		path: 'numero-persone',
		loadComponent: () =>
			import(
				'../../pages/prenotazioni/numero-persone/numero-persone.page'
			).then((m) => m.NumeroPersonePage),
	},
	{
		path: 'scelta-giorno',
		loadComponent: () =>
			import(
				'../../pages/prenotazioni/scelta-giorno/scelta-giorno.page'
			).then((m) => m.SceltaGiornoPage),
	},
];
