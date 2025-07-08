import { Routes } from '@angular/router';
import { authGuard } from '../guards/auth.guard';

export const cameriereRoutes: Routes = [
	{
		path: 'visualizza-tavoli-cameriere',
		loadComponent: () =>
			import(
				'../../pages/cameriere/visualizza-tavoli-cameriere/visualizza-tavoli-cameriere.page'
			).then((m) => m.VisualizzaTavoliCamerierePage),
		canActivate: [authGuard(['cameriere'])],
	},
	{
		path: 'visualizza-ordini-cameriere',
		loadComponent: () =>
			import(
				'../../pages/cameriere/visualizza-ordini-cameriere/visualizza-ordini-cameriere.page'
			).then((m) => m.VisualizzaOrdiniCamerierePage),
		canActivate: [authGuard(['cameriere'])],
	},
];
