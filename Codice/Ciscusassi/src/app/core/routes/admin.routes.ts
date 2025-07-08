import { Routes } from '@angular/router';
import { authGuard } from '../guards/auth.guard';

export const adminRoutes: Routes = [
	{
		path: 'amministrazione',
		loadComponent: () =>
			import(
				'../../pages/admin/amministrazione/amministrazione.page'
			).then((m) => m.AmministrazionePage),
		canActivate: [authGuard(['amministratore'])],
	},
	{
		path: 'visualizza-utili',
		loadComponent: () =>
			import(
				'../../pages/admin/visualizza-utili/visualizza-utili.page'
			).then((m) => m.VisualizzaUtiliPage),
	},
	{
		path: 'gestisci-piatti',
		loadComponent: () =>
			import(
				'../../pages/admin/gestisci-piatti/gestisci-piatti.page'
			).then((m) => m.GestisciPiattiPage),
	},
	{
		path: 'gestisci-filiali',
		loadComponent: () =>
			import(
				'../../pages/admin/gestisci-filiali/gestisci-filiali.page'
			).then((m) => m.GestisciFilialiPage),
	},
	{
		path: 'aggiungi-piatti',
		loadComponent: () =>
			import(
				'../../pages/admin/aggiungi-piatti/aggiungi-piatti.page'
			).then((m) => m.AggiungiPiattiPage),
	},
	{
		path: 'modifica-piatti',
		loadComponent: () =>
			import(
				'../../pages/admin/modifica-piatti/modifica-piatti.page'
			).then((m) => m.ModificaPiattiPage),
	},
	{
		path: 'aggiungi-filiali',
		loadComponent: () =>
			import(
				'../../pages/admin/aggiungi-filiali/aggiungi-filiali.page'
			).then((m) => m.AggiungiFilialiPage),
	},
	{
		path: 'modifica-filiali',
		loadComponent: () =>
			import(
				'../../pages/admin/modifica-filiali/modifica-filiali.page'
			).then((m) => m.ModificaFilialiPage),
	},
	{
		path: 'gestisci-impiegati',
		loadComponent: () =>
			import(
				'../../pages/admin/gestisci-impiegati/gestisci-impiegati.page'
			).then((m) => m.GestisciImpiegatiPage),
	},
	{
		path: 'aggiungi-impiegati',
		loadComponent: () =>
			import(
				'../../pages/admin/aggiungi-impiegati/aggiungi-impiegati.page'
			).then((m) => m.AggiungiImpiegatiPage),
	},
	{
		path: 'modifica-impiegati',
		loadComponent: () =>
			import(
				'../../pages/admin/modifica-impiegati/modifica-impiegati.page'
			).then((m) => m.ModificaImpiegatiPage),
	},
];
