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
	IonIcon,
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
import { RegistrationData } from 'src/app/core/interfaces/Credentials';
import { ApiResponse } from 'src/app/core/interfaces/ApiResponse';
import { IonInput } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

import { ToastController } from '@ionic/angular';

@Component({
	selector: 'app-signin',
	templateUrl: './signin.page.html',
	styleUrls: ['./signin.page.scss'],
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
		IonInputPasswordToggle,
		IonAvatar,
	],
})
export class SigninPage implements OnInit {
	formRegistrazione: FormGroup = new FormGroup({});
	error: boolean = false;
	loading: boolean = false;
	errorMsg: string = '';
	credenziali: RegistrationData = {
		nome: '',
		cognome: '',
		data_nascita: '',
		image: '',
		email: '',
		nuovaPassword: '',
		confermaPassword: '',
	};
	dataMaxOggi: string = '';

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
				'Registrazione completata con successo!',
				'success'
			);
			this.router.navigate(['/login']);
		} else {
			this.errorMsg = 'Errore durante la registrazione.';
			this.error = true;
		}
	}
	ngOnInit() {
		this.formRegistrazione = this.fb.group(
			{
				nome: ['', [Validators.required, , Validators.minLength(2)]],
				cognome: ['', [Validators.required, , Validators.minLength(2)]],
				dataNascita: [
					'',
					[Validators.required, this.validDateOfBirthValidator()],
				],

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
							'^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{6,}$'
						),
					],
				],
				confermaPassword: ['', Validators.required],
			},
			{
				validators: this.matchPassword(),
			}
		);

		const oggi = new Date();
		const anno = oggi.getFullYear();
		const mese = String(oggi.getMonth() + 1).padStart(2, '0'); // mesi da 0 a 11
		const giorno = String(oggi.getDate()).padStart(2, '0');
		this.dataMaxOggi = `${anno}-${mese}-${giorno}`;
	}

	async onSubmit() {
		this.loading = true;

		if (this.formRegistrazione.valid) {
			this.credenziali.nome = this.formRegistrazione.value.nome;
			this.credenziali.cognome = this.formRegistrazione.value.cognome;
			this.credenziali.data_nascita =
				this.formRegistrazione.value.dataNascita.trim();
			this.credenziali.email = this.formRegistrazione.value.email;
			this.credenziali.nuovaPassword =
				this.formRegistrazione.value.password;
			this.credenziali.confermaPassword =
				this.formRegistrazione.value.confermaPassword;

			try {
				if (this.credenziali.image === '') {
					this.credenziali.image = await this.loadDefaultImage();
				}
				this.authenticationService
					.registrati(this.credenziali)
					.subscribe({
						next: (response) => this.handleResponse(response),
						error: (err) => {
							if (err.status === 400 && err.path == "data_nascita") {
								this.errorMsg = 'Devi essere maggiorenne!';
							} else if (err.status === 400){
								this.errorMsg = 'Email già registrata!';
							}else {
								this.errorMsg =
									'Errore durante la registrazione.';
							}
							console.log(err);
							this.error = true;
							this.loading = false;
						},
					});
			} catch (err) {
				console.error('Errore nel caricamento immagine:', err);
				this.error = true;
				this.loading = false;
			}
		}
	}

	matchPassword(): ValidatorFn {
		return (group: AbstractControl): ValidationErrors | null => {
			const passwordControl = group.get('password');
			const confermaControl = group.get('confermaPassword');

			if (!passwordControl || !confermaControl) return null;

			const password = passwordControl.value;
			const conferma = confermaControl.value;

			// Se i campi coincidono, rimuovi l'errore da confermaPassword
			if (password === conferma) {
				confermaControl.setErrors(null);
				return null;
			}

			// Altrimenti imposta l'errore
			confermaControl.setErrors({ passwordMismatch: true });
			return { passwordMismatch: true };
		};
	}

	async loadDefaultImage(): Promise<string> {
		const response = await fetch(
			'https://ionicframework.com/docs/img/demos/avatar.svg'
		);
		const blob = await response.blob();
		return this.convertToBase64(blob);
	}

	convertToBase64(blob: Blob): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onloadend = () => resolve(reader.result as string);
			reader.onerror = reject;
			reader.readAsDataURL(blob); // Converte in base64
		});
	}

	async onFileSelected(event: any): Promise<void> {
		const file = event.target.files[0];
		if (file && file.type.startsWith('image/')) {
			const reader = new FileReader();
			reader.onload = async () => {
				const image = reader.result as string;
				this.credenziali.image = await this.convertToBase64(
					await (await fetch(image)).blob()
				);
			};
			reader.readAsDataURL(file);
		} else {
			this.presentToast('Seleziona un file immagine valida.', 'warning');
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

	validDateOfBirthValidator(): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const value = control.value;
			if (!value) return null;

			const inputDate = new Date(value);
			const today = new Date();
			const minDate = new Date('1900-01-01');

			if (inputDate < minDate) {
				return { tooOld: true }; // prima del 1900
			}

			if (inputDate > today) {
				return { futureDate: true }; // dopo oggi
			}

			// Calcola la data di oggi meno 18 anni
			const eighteenYearsAgo = new Date(
				today.getFullYear() - 18,
				today.getMonth(),
				today.getDate()
			);

			if (inputDate > eighteenYearsAgo) {
				return { underage: true }; // non è maggiorenne
			}

			return null;
		};
	}
	get dataNascitaErrorText(): string {
		const control = this.formRegistrazione.get('dataNascita');
		if (control?.touched && control.errors) {
			if (control.errors['tooOld']) {
				return 'Data troppo vecchia: inserisci una data successiva al 01/01/1900.';
			}
			if (control.errors['futureDate']) {
				return 'La data non può essere nel futuro.';
			}
			if (control.errors['underage']) {
				return 'Devi essere maggiorenne.';
			}
			return 'Data di nascita non valida.'; // fallback
		}
		return '';
	}
}
