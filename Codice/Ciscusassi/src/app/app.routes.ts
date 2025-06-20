import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
	{
		path: 'home',
		loadComponent: () =>
			import('./pages/home/home.page').then((m) => m.HomePage),
	},
	{
		path: '',
		redirectTo: 'home',
		pathMatch: 'full',
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
	{
		path: 'ordina-ora',
		loadComponent: () =>
			import('./pages/ordinazioni/ordina-ora/ordina-ora.page').then(
				(m) => m.OrdinaOraPage
			),
	},
	{
		path: 'prenota',
		loadComponent: () =>
			import('./pages/prenota/prenota.page').then((m) => m.PrenotaPage),
	},
	{
		path: 'amministrazione',
		loadComponent: () =>
			import('./pages/admin/amministrazione/amministrazione.page').then(
				(m) => m.AmministrazionePage
			),
		canActivate: [authGuard(['amministratore'])],
	},
	{
		path: 'gestione-account',
		loadComponent: () =>
			import(
				'./pages/account/gestione-account/gestione-account.page'
			).then((m) => m.GestioneAccountPage),
	},
	{
		path: 'login',
		loadComponent: () =>
			import('./pages/account/login/login.page').then((m) => m.LoginPage),
	},
	{
		path: 'signin',
		loadComponent: () =>
			import('./pages/account/signin/signin.page').then(
				(m) => m.SigninPage
			),
	},
	{
		path: 'ordina-al-tavolo',
		loadComponent: () =>
			import(
				'./pages/ordinazioni/ordina-al-tavolo/ordina-al-tavolo.page'
			).then((m) => m.OrdinaAlTavoloPage),
	},
	{
		path: 'ordina-asporto',
		loadComponent: () =>
			import(
				'./pages/ordinazioni/ordina-asporto/ordina-asporto.page'
			).then((m) => m.OrdinaAsportoPage),
	},
	{
		path: 'visualizza-utili',
		loadComponent: () =>
			import('./pages/admin/visualizza-utili/visualizza-utili.page').then(
				(m) => m.VisualizzaUtiliPage
			),
	},
	{
		path: 'gestisci-piatti',
		loadComponent: () =>
			import('./pages/admin/gestisci-piatti/gestisci-piatti.page').then(
				(m) => m.GestisciPiattiPage
			),
	},
	{
		path: 'gestisci-filiali',
		loadComponent: () =>
			import('./pages/admin/gestisci-filiali/gestisci-filiali.page').then(
				(m) => m.GestisciFilialiPage
			),
	},
	{
		path: 'aggiungi-piatti',
		loadComponent: () =>
			import('./pages/admin/aggiungi-piatti/aggiungi-piatti.page').then(
				(m) => m.AggiungiPiattiPage
			),
	},
	{
		path: 'modifica-piatti',
		loadComponent: () =>
			import('./pages/admin/modifica-piatti/modifica-piatti.page').then(
				(m) => m.ModificaPiattiPage
			),
	},
	{
		path: 'aggiungi-filiali',
		loadComponent: () =>
			import('./pages/admin/aggiungi-filiali/aggiungi-filiali.page').then(
				(m) => m.AggiungiFilialiPage
			),
	},
	{
		path: 'modifica-filiali',
		loadComponent: () =>
			import('./pages/admin/modifica-filiali/modifica-filiali.page').then(
				(m) => m.ModificaFilialiPage
			),
	},
	{
		path: 'modifica-dipendenti',
		loadComponent: () =>
			import(
				'./pages/admin/modifica-dipendenti/modifica-dipendenti.page'
			).then((m) => m.ModificaDipendentiPage),
	},
	{
		path: 'menu-tavolo',
		loadComponent: () =>
			import('./pages/ordinazioni/menu-tavolo/menu-tavolo.page').then(
				(m) => m.MenuTavoloPage
			),
	},
	{
		path: 'menu-asporto',
		loadComponent: () =>
			import('./pages/ordinazioni/menu-asporto/menu-asporto.page').then(
				(m) => m.MenuAsportoPage
			),
	},
	{
		path: 'pagamento-asporto',
		loadComponent: () =>
			import(
				'./pages/ordinazioni/pagamento-asporto/pagamento-asporto.page'
			).then((m) => m.PagamentoAsportoPage),
	},
	{
		path: 'ringraziamenti-asporto',
		loadComponent: () =>
			import(
				'./pages/ordinazioni/ringraziamenti-asporto/ringraziamenti-asporto.page'
			).then((m) => m.RingraziamentiAsportoPage),
	},
	{
		path: 'aggiungi-dipendenti',
		loadComponent: () =>
			import(
				'./pages/admin/aggiungi-dipendenti/aggiungi-dipendenti.page'
			).then((m) => m.AggiungiDipendentiPage),
	},
	{
		path: 'modifica-dati-dipendenti',
		loadComponent: () =>
			import(
				'./pages/admin/modifica-dati-dipendenti/modifica-dati-dipendenti.page'
			).then((m) => m.ModificaDatiDipendentiPage),
	},
	{
		path: 'dati-account',
		loadComponent: () =>
			import('./pages/account/dati-account/dati-account.page').then(
				(m) => m.DatiAccountPage
			),
	},
	{
		path: 'cambia-password',
		loadComponent: () =>
			import('./pages/account/cambia-password/cambia-password.page').then(
				(m) => m.CambiaPasswordPage
			),
	},
	{
		path: 'cambia-email',
		loadComponent: () =>
			import('./pages/account/cambia-email/cambia-email.page').then(
				(m) => m.CambiaEmailPage
			),
	},
	{
		path: 'visualizza-ordini',
		loadComponent: () =>
			import(
				'./pages/ordinazioni/visualizza-ordini/visualizza-ordini.page'
			).then((m) => m.VisualizzaOrdiniPage),
	},
	{
		path: 'visualizza-tavoli',
		loadComponent: () =>
			import(
				'./pages/cameriere/visualizza-tavoli/visualizza-tavoli.page'
			).then((m) => m.VisualizzaTavoliPage),
	},  {
    path: 'pagamento-tavolo',
    loadComponent: () => import('./pages/ordinazioni/pagamento-tavolo/pagamento-tavolo.page').then( m => m.PagamentoTavoloPage)
  },
  {
    path: 'pagamento-carta',
    loadComponent: () => import('./pages/ordinazioni/pagamento-carta/pagamento-carta.page').then( m => m.PagamentoCartaPage)
  },
  {
    path: 'pagamento-cassa',
    loadComponent: () => import('./pages/ordinazioni/pagamento-cassa/pagamento-cassa.page').then( m => m.PagamentoCassaPage)
  },

];

export const AppRoutingModule = provideRouter(routes);
