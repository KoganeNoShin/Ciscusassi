import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'menu',
    loadComponent: () => import('./pages/menu/menu.page').then(m => m.MenuPage)
  },
  {
    path: 'ristoranti',
    loadComponent: () => import('./pages/ristoranti/ristoranti.page').then(m => m.RistorantiPage)
  },
  {
    path: 'ordina-ora',
    loadComponent: () => import('./pages/ordina-ora/ordina-ora.page').then(m => m.OrdinaOraPage)
  },
  {
    path: 'prenota',
    loadComponent: () => import('./pages/prenota/prenota.page').then(m => m.PrenotaPage)
  },
  {
    path: 'amministrazione',
    loadComponent: () => import('./pages/admin/amministrazione/amministrazione.page').then(m => m.AmministrazionePage)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/account/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'signin',
    loadComponent: () => import('./pages/account/signin/signin.page').then(m => m.SigninPage)
  },  {
    path: 'ordina-al-tavolo',
    loadComponent: () => import('./pages/ordina-ora/ordina-al-tavolo/ordina-al-tavolo.page').then( m => m.OrdinaAlTavoloPage)
  },
  {
    path: 'ordina-asporto',
    loadComponent: () => import('./pages/ordina-ora/ordina-asporto/ordina-asporto.page').then( m => m.OrdinaAsportoPage)
  },


];

export const AppRoutingModule = provideRouter(routes);