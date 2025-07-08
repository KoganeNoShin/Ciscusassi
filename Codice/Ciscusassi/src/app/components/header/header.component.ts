import { Component, OnInit } from '@angular/core';
import {
	IonHeader,
	IonIcon,
	IonToolbar,
	IonButtons,
	IonButton,
	IonAvatar,
	IonMenuButton,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { personCircle } from 'ionicons/icons';
import { CarrelloService } from 'src/app/core/services/carrello.service';
import { RouterModule } from '@angular/router';
import { AuthenticationService } from 'src/app/core/services/authentication.service';

/**
 * Componente custom utilizzato per creare un header personalizzato con tutti i bottoni
 * per navigare le rotte del sito, e controlli immediati in base al cambio di ruolo dell'utente.
 */
@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.scss'],
	imports: [
		IonAvatar,
		RouterModule,
		IonHeader,
		IonIcon,
		IonToolbar,
		IonButtons,
		IonButton,
		IonMenuButton,
	],
	standalone: true,
})
export class HeaderComponent implements OnInit {
	role: string = '';
	avatar: string = '';

	constructor(
		private authService: AuthenticationService,
		private servizioCarrello: CarrelloService
	) {
		addIcons({ personCircle });
	}

	/**
	 * Funzione per svuotare il carrello ogni volta che entriamo nella pagina di ordinazione
	 * per evitare che l'utente si ritrovi ordini non voluti nel carrello
	 */
	svuotaCarrello() {
		console.log('svuoto il carrello');
		this.servizioCarrello.svuotaCarrello();
	}

	/**
	 * All'inizializazzione del componente, iscriviamo role e avatar agli observable
	 * della {@link AuthenticationService} per rispecchiare immediatamente ogni cambiamento che avviene.
	 */
	ngOnInit() {
		this.authService.role$.subscribe((role) => {
			this.role = role;
		});

		this.authService.avatar$.subscribe((avatar) => {
			this.avatar = avatar;
		});
	}
}
