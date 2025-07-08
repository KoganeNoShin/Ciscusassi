import { Routes } from '@angular/router';

export const accountRoutes: Routes = [
	{
		path: 'gestione-account',
		loadComponent: () =>
			import(
				'../../pages/account/gestione-account/gestione-account.page'
			).then((m) => m.GestioneAccountPage),
	},
	{
		path: 'login',
		loadComponent: () =>
			import('../../pages/account/login/login.page').then(
				(m) => m.LoginPage
			),
	},
	{
		path: 'recupera-password',
		loadComponent: () =>
			import(
				'../../pages/account/recupera-password/recupera-password.page'
			).then((m) => m.RecuperaPasswordPage),
	},
	{
		path: 'signin',
		loadComponent: () =>
			import('../../pages/account/signin/signin.page').then(
				(m) => m.SigninPage
			),
	},
	{
		path: 'dati-account',
		loadComponent: () =>
			import('../../pages/account/dati-account/dati-account.page').then(
				(m) => m.DatiAccountPage
			),
	},
	{
		path: 'cambia-password',
		loadComponent: () =>
			import(
				'../../pages/account/cambia-password/cambia-password.page'
			).then((m) => m.CambiaPasswordPage),
	},
	{
		path: 'cambia-email',
		loadComponent: () =>
			import('../../pages/account/cambia-email/cambia-email.page').then(
				(m) => m.CambiaEmailPage
			),
	},
];
