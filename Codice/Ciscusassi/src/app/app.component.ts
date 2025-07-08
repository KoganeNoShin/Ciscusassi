import { Component } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

import {
	IonApp,
	IonMenuToggle,
	IonRouterOutlet,
} from '@ionic/angular/standalone';

import { HeaderComponent } from 'src/app/components/header/header.component';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { AuthenticationService } from './core/services/authentication.service';

import { Title } from '@angular/platform-browser';
import { filter } from 'rxjs/operators';

import { Router, NavigationEnd } from '@angular/router';
import { RouterModule } from '@angular/router';

import {
	IonContent,
	IonList,
	IonTitle,
	IonItem,
	IonMenu,
	IonHeader,
	IonToolbar,
	IonIcon,
	IonLabel,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
	home,
	newspaper,
	location,
	restaurant,
	calendar,
} from 'ionicons/icons';

/**
 * 	Componente principale dell'app, contiene l'interezza dell'applicazione.
 * 	Ogni componente specificato dentro questo, verrà inserito in ogni pagina!
 *
 * 	Si occupa inoltre di cambiare titolo alla pagina in base alla rotta nella quale stiamo navigando.
 *
 * 	Inizializza l'{@link AuthenticationService} e l'ionic-storage all'avvio dell'applicazione.
 */
@Component({
	selector: 'app-root',
	templateUrl: 'app.component.html',
	styleUrls: ['./app.component.scss'],
	imports: [
		IonApp,
		IonRouterOutlet,
		RouterModule,
		HeaderComponent,
		FooterComponent,
		IonMenu,
		IonTitle,
		IonContent,
		IonList,
		IonItem,
		IonHeader,
		IonToolbar,
		IonMenuToggle,
		IonIcon,
		IonLabel,
	],
})
export class AppComponent {
	constructor(
		private storage: Storage, // Gestione dello storage locale (sessioni, preferenze, ecc.)
		private authService: AuthenticationService, // Servizio di autenticazione per gestire login/logout, ruoli, ecc.
		private router: Router, // Router Angular per eventi di navigazione
		private titleService: Title // Usato per aggiornare dinamicamente il titolo della pagina
	) {
		this.initStorage(); // Inizializza storage e autenticazione al boot

		// Ascolta gli eventi di navigazione per aggiornare il titolo della pagina
		this.router.events
			.pipe(filter((event) => event instanceof NavigationEnd))
			.subscribe(() => {
				const url = this.router.url;
				const lastSegment = url.split('/').filter(Boolean).pop(); // Estrae l'ultima parte del path
				const capitalized = lastSegment
					? lastSegment[0].toUpperCase() + lastSegment.slice(1)
					: 'App'; // Capitalizza per renderlo più leggibile nel titolo
				this.titleService.setTitle('Ciscusassi - ' + capitalized); // Aggiorna il titolo del documento
			});

		// Registra le icone utilizzate nel menu
		addIcons({ home, newspaper, location, restaurant, calendar });
	}

	// Inizializza lo storage e il servizio di autenticazione
	async initStorage() {
		await this.storage.create(); // Prepara lo storage (richiesto da Ionic Storage)
		await this.authService.init(); // Inizializza la sessione di autenticazione (es. token persistente)
	}
}
