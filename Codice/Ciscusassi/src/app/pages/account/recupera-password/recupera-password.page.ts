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
	IonAvatar,
} from '@ionic/angular/standalone';

import {
	FormsModule,
	ReactiveFormsModule,
	FormGroup,
	FormBuilder,
	Validators,
	ValidatorFn,
	AbstractControl,
	ValidationErrors,
} from '@angular/forms';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import {
	LoginRecord,
	OurTokenPayload,
	RegistrationData,
} from 'src/app/core/interfaces/Credentials';
import { ApiResponse } from 'src/app/core/interfaces/ApiResponse';
import { IonInput } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

import { inject } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { image } from 'ionicons/icons';

@Component({
	selector: 'app-recupera-password',
	templateUrl: './recupera-password.page.html',
	styleUrls: ['./recupera-password.page.scss'],
	standalone: true,
	imports: [
		IonSpinner,
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
	],
})
export class RecuperaPasswordPage implements OnInit {
	formRecuperaPassword: FormGroup = new FormGroup({});
	error: boolean = false;
	loading: boolean = false;
	errorMsg: string = '';
	pagina: number = 0;
	email: string = '';

	constructor(
		private fb: FormBuilder,
		private authenticationService: AuthenticationService,
		private router: Router,
		private toastController: ToastController
	) {}

	private handleResponse(response: ApiResponse<any>): void {
		console.log(response);
		if (response.success) {
			this.presentToast(
				'Se esiste un account con questa email verrà inviata una password temporaranea',
				'success'
			);
			this.loading = false;
			this.error = false;
			this.router.navigate(['/login']);
		} else {
			this.errorMsg =
				response.message ||
				"Si è verificato un errore durante la modifica dell'email.";
			this.error = true;
		}
	}
	ngOnInit() {
		this.ngViewWillEnter();
	}

	ngViewWillEnter() {
		this.formRecuperaPassword.reset();
		this.error = false;
		this.loading = false;
		this.errorMsg = '';
		this.formRecuperaPassword = this.fb.group({
			email: ['', [Validators.required, Validators.email]],
		});
	}

	async onSubmit() {
		this.loading = true;

		if (this.formRecuperaPassword.valid) {
			this.email = this.formRecuperaPassword.value.email;
			console.log(this.email);

			this.authenticationService.recuperaPassword(this.email).subscribe({
				next: (response) => this.handleResponse(response),
				error: (err) => {
					this.errorMsg =
						"Formato email non valido oppure c'è stato un errore nel server.";
					console.log(err);
					this.error = true;
					this.loading = false;
				},
			});
		}
	}
	async presentToast(
		message: string,
		color: 'success' | 'danger' | 'warning'
	) {
		// Mostra un toast di notifica con messaggio e colore specificati
		const toast = await this.toastController.create({
			message,
			duration: 2500,
			position: 'top',
			color,
		});
		toast.present();
	}
}
