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
import { inject } from '@angular/core';
import { NavController } from '@ionic/angular';
import { RouterModule } from '@angular/router';

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
		RouterModule
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
		private navigation: NavController,
	) {}

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
			console.error(response.message || 'Errore sconosciuto');
			this.errorMsg = response.message || 'Errore sconosciuto';
			this.error = true;
		}

		this.loading = false;
	}

	ngOnInit() {
		this.formLogin = this.fb.group({
			email: ['', [Validators.required, Validators.email]],
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
		this.formLogin.markAllAsTouched();
	}

	onSubmit() {
		this.loading = true;

		if (this.formLogin.valid) {
			const credentials: Credentials = this.formLogin.value;

			this.authenticationService.login(credentials).subscribe({
				next: (response) => this.handleResponse(response),
				error: (err) => {
					this.errorMsg =
						err?.error?.message ||
						err.message ||
						'Errore durante il login.';

					console.log(err);
					this.error = true;
					this.loading = false;
				},
			});
		}
	}
}
