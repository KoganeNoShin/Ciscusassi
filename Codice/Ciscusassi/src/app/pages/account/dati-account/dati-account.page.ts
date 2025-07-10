import { Component, OnInit } from '@angular/core';

import {
	IonContent,
	IonGrid,
	IonCol,
	IonRow,
	IonImg,
	IonCard,
	IonText,
	IonButton,
	IonCardContent,
	IonSpinner,
	IonAvatar,
	NavController,
} from '@ionic/angular/standalone';

import { RouterModule } from '@angular/router';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { ApiResponse } from 'src/app/core/interfaces/ApiResponse';

import { Router } from '@angular/router';

@Component({
	selector: 'app-dati-account',
	templateUrl: './dati-account.page.html',
	styleUrls: ['./dati-account.page.scss'],
	standalone: true,
	imports: [
		IonAvatar,
		IonSpinner,
		IonCardContent,
		IonContent,
		IonGrid,
		IonCol,
		IonRow,
		IonImg,
		IonCard,
		IonButton,
		RouterModule,
		IonAvatar,
		IonText,
	],
})
export class DatiAccountPage implements OnInit {
	username: string = '';
	role: string = '';
	avatar: string = '';
	points: number = 0;

	loading: boolean = true;
	loadingLogout: boolean = false;

	error: boolean = false;
	errorMsg: string = '';

	constructor(
		private authService: AuthenticationService,
		private router: Router,
		private navigator: NavController
	) {}

	ngOnInit() {
		this.authService.username$.subscribe((username) => {
			this.username = username;
		});

		this.authService.role$.subscribe((role) => {
			this.role = role;
		});

		this.authService.avatar$.subscribe((avatar) => {
			this.avatar = avatar;
		});

		if (this.role == 'cliente') {
			this.authService.getPoints().subscribe({
				next: (response) => this.handleResponse(response),
				error: (err) => {
					console.log(err);
					this.error = true;
					this.loading = false;
				},
			});
		}
	}

	/**
	 * Gestisce la risposta ricevuta da una chiamata API che restituisce un numero (ad esempio punti).
	 *
	 * La funzione analizza la risposta (`ApiResponse<number>`): se ha successo, aggiorna il valore di `points`
	 * con i dati ricevuti; altrimenti imposta lo stato di errore e memorizza il messaggio di errore.
	 * In entrambi i casi, disattiva lo stato di caricamento.
	 *
	 * @param {ApiResponse<number>} response - La risposta dell’API contenente un valore numerico o un messaggio d’errore.
	 *
	 * @returns {void}
	 *
	 * @remarks
	 * - Se `response.success` è `true`, assegna `response.data` alla proprietà `points`.
	 * - Se `response.success` è `false`, registra l’errore nella console, imposta `error` a `true`
	 *   e assegna il messaggio d’errore alla proprietà `errorMsg`.
	 * - In ogni caso, `loading` viene impostato a `false` per indicare il termine del processo.
	 */
	private handleResponse(response: ApiResponse<number>): void {
		console.log(response);

		if (response.success) {
			this.points = response.data!;
		} else {
			console.error(response.message || 'Errore sconosciuto');
			this.error = true;
			this.errorMsg = response.message ?? 'Errore sconosciuto';
		}

		this.loading = false;
	}

	/**
	 * Esegue il processo di logout dell’utente.
	 *
	 * Imposta lo stato di caricamento, invoca il servizio di autenticazione per effettuare il logout
	 * e reindirizza l’utente alla pagina di login. In caso di errore, registra il problema,
	 * imposta lo stato di errore e mostra un messaggio appropriato.
	 *
	 * @async
	 * @returns {Promise<void>} - Non restituisce alcun valore, ma modifica lo stato dell'applicazione.
	 *
	 * @remarks
	 * - Imposta `loadingLogout` a `true` all’inizio del processo.
	 * - In caso di successo, reimposta `loadingLogout` a `false` e naviga alla pagina `/login`.
	 * - In caso di errore, stampa l’errore nella console, imposta `error` a `true`,
	 *   assegna un messaggio di errore a `errorMsg` e disattiva `loadingLogout`.
	 */
	async logout() {
		this.loadingLogout = true;
		try {
			await this.authService.logout();
			this.loadingLogout = false;
			this.router.navigate(['/login']);
		} catch (err) {
			console.error('Errore durante il logout:', err);
			this.error = true;
			this.errorMsg = 'Errore durante il logout. Riprova più tardi.';
			this.loadingLogout = false;
		}
	}
}
