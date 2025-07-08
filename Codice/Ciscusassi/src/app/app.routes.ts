import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';

// File delle rotte divise per categoria
import { accountRoutes } from './core/routes/account.routes';
import { adminRoutes } from './core/routes/admin.routes';
import { cameriereRoutes } from './core/routes/cameriere.routes';
import { chefRoutes } from './core/routes/chef.routes';
import { ordinazioniRoutes } from './core/routes/ordinazioni.routes';
import { prenotazioniRoutes } from './core/routes/prenotazioni.routes';

/**
 * Questo è l'array delle rotte di tutta l'applicazione ionic.
 *
 * Ogni pagina visitabile ha la propria rotta specificata qui o in uno dei file importati.
 *
 * Le rotte sono state divise in diversi file seguendo le path delle relative pagine.
 */
export const routes: Routes = [
	{
		path: '', // La rotta nulla che serve per reindirizzare alla home
		redirectTo: 'home',
		pathMatch: 'full',
	},
	{
		path: 'home',
		loadComponent: () =>
			import('./pages/home/home.page').then((m) => m.HomePage),
	},
	{
		path: 'menu',
		loadComponent: () =>
			import('./pages/menu/menu.page').then((m) => m.MenuPage),
	},
	{
		path: 'ristoranti',
		loadComponent: () =>
			import('./pages/ristoranti/ristoranti.page').then(
				(m) => m.RistorantiPage
			),
	},

	// Includiamo le rotte dei file importati precedentemente

	...accountRoutes,
	...adminRoutes,
	...cameriereRoutes,
	...chefRoutes,
	...ordinazioniRoutes,
	...prenotazioniRoutes,

	// Rotta wildcard di fallback (Pagina 404)
	{
		path: '**',
		loadComponent: () =>
			import('./pages/not-found/not-found.page').then(
				(m) => m.NotFoundPage
			),
	},
];

export const AppRoutingModule = provideRouter(routes);
