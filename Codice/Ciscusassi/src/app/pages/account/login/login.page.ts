import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
	IonContent,
	IonGrid,
	IonCol,
	IonRow,
	IonImg,
	IonCard,
	IonText,
	IonButton,
	IonItem,
	IonSpinner,
	IonInputPasswordToggle,
} from '@ionic/angular/standalone';

import {
	FormsModule,
	ReactiveFormsModule,
	FormGroup,
	FormBuilder,
	Validators,
} from '@angular/forms';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import {
	Credentials,
	LoginRecord,
	OurTokenPayload,
} from 'src/app/core/interfaces/Credentials';
import { ApiResponse } from 'src/app/core/interfaces/ApiResponse';
import { IonInput } from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';
import { RouterModule } from '@angular/router';

/**
 * Pagina che permette all'utente di loggare con le proprie credenziali,
 * che si tratti di un cliente, cameriere, chef oppure un amministratore
 */
@Component({
	selector: 'app-login',
	templateUrl: './login.page.html',
	styleUrls: ['./login.page.scss'],
	standalone: true,
	imports: [
		IonSpinner,
		IonItem,
		IonButton,
		IonText,
		IonCard,
		IonImg,
		IonRow,
		IonCol,
		IonGrid,
		IonContent,
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		IonInput,
		IonInputPasswordToggle,
		RouterModule,
	],
})
export class LoginPage implements OnInit {
	formLogin: FormGroup = new FormGroup({});
	error: boolean = false;
	loading: boolean = false;
	errorMsg: string = '';

	constructor(
		private fb: FormBuilder,
		private authenticationService: AuthenticationService,
		private navigation: NavController
	) {}

	/**
	 * Gestisce la risposta della richiesta di login e imposta i dati utente se il login ha successo.
	 *
	 * Analizza l’oggetto `ApiResponse<LoginRecord>` ricevuto dopo una richiesta di autenticazione.
	 * Se la risposta è positiva, decodifica il token, estrae i dati utente e li salva nel servizio di autenticazione.
	 * In caso di errore durante il salvataggio o se la risposta non è valida, imposta lo stato di errore.
	 *
	 * @param {ApiResponse<LoginRecord>} response - La risposta dell’API contenente i dati del login oppure un messaggio d’errore.
	 *
	 * @returns {void}
	 *
	 * @remarks
	 * - Se `response.success` e `response.data` sono presenti:
	 *   - Decodifica il token JWT per ottenere i dati utente.
	 *   - Salva ID utente, token, ruolo, username, avatar e ID filiale nei rispettivi metodi del servizio di autenticazione.
	 *   - Naviga alla pagina principale (`/home`) dopo il completamento.
	 * - In caso di errore nel salvataggio, mostra un messaggio d’errore e imposta lo stato di errore.
	 * - Se la risposta non ha successo, imposta un messaggio d’errore generico e attiva lo stato di errore.
	 * - In ogni caso, `loading` viene impostato a `false` al termine.
	 */
	private handleResponse(response: ApiResponse<LoginRecord>): void {
		console.log(response);

		if (response.success && response.data) {
			const risposta: LoginRecord = response.data;

			const tokenPayload: OurTokenPayload =
				this.authenticationService.decodeTokenPayload(risposta.token);

			Promise.all([
				this.authenticationService.setIdUtente(tokenPayload.id_utente),
				this.authenticationService.setToken(risposta.token),
				this.authenticationService.setRole(tokenPayload.ruolo),
				this.authenticationService.setUsername(tokenPayload.username),
				this.authenticationService.setAvatar(risposta.avatar),
				this.authenticationService.setFiliale(tokenPayload.id_filiale),
			])
				.then(() => this.navigation.navigateRoot('/home'))
				.catch((err) => {
					console.error(
						'Errore durante il salvataggio dei dati:',
						err
					);
					this.errorMsg = 'Errore durante il salvataggio dei dati.';
					this.error = true;
				});
		} else {
			this.errorMsg = 'Errore: per favore riprova più tardi.';
			this.error = true;
		}

		this.loading = false;
	}

	ngOnInit() {
		this.formLogin = this.fb.group({
			email: [
				'',
				[
					Validators.required,
					Validators.pattern(
						'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
					),
				],
			],
			password: [
				'',
				[
					Validators.required,
					Validators.pattern(
						'^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};:\'",.<>/?]).+$'
					),
				],
			],
		});
		this.formLogin.reset();
	}

	/**
	 * Gestisce l’invio del modulo di login.
	 *
	 * Verifica la validità del modulo, estrae le credenziali inserite e invia una richiesta di login
	 * al servizio di autenticazione. In caso di successo, passa la risposta al metodo `handleResponse`.
	 * In caso di errore, gestisce lo stato e visualizza un messaggio di errore appropriato.
	 *
	 * @returns {void}
	 *
	 * @remarks
	 * - Imposta `loading` a `true` all’inizio dell’operazione.
	 * - Se il modulo è valido:
	 *   - Recupera le credenziali dall’oggetto `formLogin`.
	 *   - Esegue la chiamata `login()` e sottoscrive la risposta.
	 * - In caso di successo (`next`), passa il risultato a `handleResponse`.
	 * - In caso di errore (`error`):
	 *   - Se lo status è `401`, mostra un messaggio di errore per credenziali non valide.
	 *   - Altrimenti, mostra un messaggio generico di errore.
	 *   - Imposta `error` a `true` e disattiva lo stato `loading`.
	 */
	onSubmit() {
		this.loading = true;

		if (this.formLogin.valid) {
			const credentials: Credentials = this.formLogin.value;

			this.authenticationService.login(credentials).subscribe({
				next: (response) => this.handleResponse(response),
				error: (err) => {
					if (err.status === 401) {
						this.errorMsg = 'Email o password errati';
					} else {
						this.errorMsg = 'Errore durante il login.';
					}
					console.log(err);
					this.error = true;
					this.loading = false;
				},
			});
		}
	}
}
