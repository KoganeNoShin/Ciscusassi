import { Routes } from '@angular/router';
import { authGuard } from '../guards/auth.guard';

export const ordinazioniRoutes: Routes = [
	{
		path: 'ordina-ora',
		loadComponent: () =>
			import('../../pages/ordinazioni/ordina-ora/ordina-ora.page').then(
				(m) => m.OrdinaOraPage
			),
		canActivate: [authGuard(['cliente'])],
	},
	{
		path: 'ordina-al-tavolo',
		loadComponent: () =>
			import(
				'../../pages/ordinazioni/ordina-al-tavolo/ordina-al-tavolo.page'
			).then((m) => m.OrdinaAlTavoloPage),
		canActivate: [authGuard(['cliente'])],
	},
	{
		path: 'ordina-asporto',
		loadComponent: () =>
			import(
				'../../pages/ordinazioni/ordina-asporto/ordina-asporto.page'
			).then((m) => m.OrdinaAsportoPage),
		canActivate: [authGuard(['cliente'])],
	},
	{
		path: 'menu-tavolo',
		loadComponent: () =>
			import('../../pages/ordinazioni/menu-tavolo/menu-tavolo.page').then(
				(m) => m.MenuTavoloPage
			),
		canActivate: [authGuard(['cliente'])],
	},
	{
		path: 'menu-asporto',
		loadComponent: () =>
			import(
				'../../pages/ordinazioni/menu-asporto/menu-asporto.page'
			).then((m) => m.MenuAsportoPage),
		canActivate: [authGuard(['cliente'])],
	},
	{
		path: 'pagamento-asporto',
		loadComponent: () =>
			import(
				'../../pages/ordinazioni/pagamento-asporto/pagamento-asporto.page'
			).then((m) => m.PagamentoAsportoPage),
		canActivate: [authGuard(['cliente'])],
	},
	{
		path: 'ringraziamenti-asporto',
		loadComponent: () =>
			import(
				'../../pages/ordinazioni/ringraziamenti-asporto/ringraziamenti-asporto.page'
			).then((m) => m.RingraziamentiAsportoPage),
		canActivate: [authGuard(['cliente'])],
	},
	{
		path: 'visualizza-ordini',
		loadComponent: () =>
			import(
				'../../pages/ordinazioni/visualizza-ordini/visualizza-ordini.page'
			).then((m) => m.VisualizzaOrdiniPage),
		canActivate: [authGuard(['cliente'])],
	},
	{
		path: 'pagamento-tavolo',
		loadComponent: () =>
			import(
				'../../pages/ordinazioni/pagamento-tavolo/pagamento-tavolo.page'
			).then((m) => m.PagamentoTavoloPage),
		canActivate: [authGuard(['cliente'])],
	},
	{
		path: 'pagamento-carta',
		loadComponent: () =>
			import(
				'../../pages/ordinazioni/pagamento-carta/pagamento-carta.page'
			).then((m) => m.PagamentoCartaPage),
		canActivate: [authGuard(['cliente'])],
	},
	{
		path: 'pagamento-cassa',
		loadComponent: () =>
			import(
				'../../pages/ordinazioni/pagamento-cassa/pagamento-cassa.page'
			).then((m) => m.PagamentoCassaPage),
		canActivate: [authGuard(['cliente'])],
	},
];
