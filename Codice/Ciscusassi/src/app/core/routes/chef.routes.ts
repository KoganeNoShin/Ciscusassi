import { Routes } from '@angular/router';
import { authGuard } from '../guards/auth.guard';

export const chefRoutes: Routes = [
	{
		path: 'visualizza-tavoli-chef',
		loadComponent: () =>
			import(
				'../../pages/chef/visualizza-tavoli-chef/visualizza-tavoli-chef.page'
			).then((m) => m.VisualizzaTavoliChefPage),
		canActivate: [authGuard(['chef'])],
	},
	{
		path: 'visualizza-ordini-chef',
		loadComponent: () =>
			import(
				'../../pages/chef/visualizza-ordini-chef/visualizza-ordini-chef.page'
			).then((m) => m.VisualizzaOrdiniChefPage),
		canActivate: [authGuard(['chef'])],
	},
];
