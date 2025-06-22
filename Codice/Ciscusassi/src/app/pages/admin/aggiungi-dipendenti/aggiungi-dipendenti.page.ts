import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
	IonContent,
	IonHeader,
	IonTitle,
	IonToolbar,
	IonCard,
	IonIcon,
	IonInput,
	IonButton,
	IonSelect,
	IonSelectOption,
	ToastController,
} from '@ionic/angular/standalone';

import { ImpiegatoService } from 'src/app/core/services/impiegato.service';
import { FilialeService } from 'src/app/core/services/filiale.service';
import { ImpiegatoInput } from 'src/app/core/interfaces/Impiegato';
import { FilialeRecord } from 'src/app/core/interfaces/Filiale';

@Component({
	selector: 'app-aggiungi-dipendenti',
	templateUrl: './aggiungi-dipendenti.page.html',
	styleUrls: ['./aggiungi-dipendenti.page.scss'],
	standalone: true,
	imports: [
		IonContent,
		IonHeader,
		IonTitle,
		IonToolbar,
		CommonModule,
		FormsModule,
		IonCard,
		IonIcon,
		IonInput,
		IonButton,
		IonSelect,
		IonSelectOption,
	],
})
export class AggiungiDipendentiPage implements OnInit {
	nome: string = '';
	cognome: string = '';
	data_nascita: string = '';
	ruolo: string = '';
	email: string = '';
	foto: string = ''; // immagine base64
	password: string = '';
	ref_filiale?: number;

	filiali: FilialeRecord[] = [];

	constructor(
		private impiegatoService: ImpiegatoService,
		private filialeService: FilialeService,
		private toastController: ToastController
	) {}

	ngOnInit() {
		this.caricaFiliali();
	}

	async presentToast(message: string, color: string = 'success') {
		const toast = await this.toastController.create({
			message,
			duration: 2000,
			color,
			position: 'bottom',
		});
		await toast.present();
	}

	onImageSelected(event: any) {
		const file = event.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				this.foto = reader.result as string;
			};
			reader.readAsDataURL(file);
		}
	}

	private isValidEmail(email: string): boolean {
		const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return re.test(email.toLowerCase());
	}

	caricaFiliali() {
		this.filialeService.GetSedi().subscribe({
			next: (res) => {
				if (res.data) {
					this.filiali = res.data;
				}
			},
			error: (err) => {
				console.error('Errore caricamento filiali:', err);
				this.presentToast(
					'Errore nel caricamento delle filiali.',
					'danger'
				);
			},
		});
	}

	aggiungiDipendente() {
		if (this.password.length < 8) {
			this.presentToast(
				'La password deve contenere almeno 8 caratteri.',
				'danger'
			);
			return;
		}

		if (!this.isValidEmail(this.email)) {
			this.presentToast('Inserisci un indirizzo email valido.', 'danger');
			return;
		}

		if (!this.ref_filiale) {
			this.presentToast('Seleziona una filiale.', 'danger');
			return;
		}

		const nuovoDipendente: ImpiegatoInput = {
			nome: this.nome,
			cognome: this.cognome,
			data_nascita: this.data_nascita,
			ruolo: this.ruolo,
			email: this.email,
			foto: this.foto,
			password: this.password,
			ref_filiale: this.ref_filiale,
		};

		this.impiegatoService.AddImpiegato(nuovoDipendente).subscribe({
			next: (response) => {
				console.log('Dipendente aggiunto con successo:', response);
				this.presentToast(
					'Dipendente aggiunto con successo!',
					'success'
				);
				this.resetForm();
			},
			error: (error) => {
				console.error(
					"Errore durante l'aggiunta del dipendente:",
					error
				);
				this.presentToast(
					"Errore durante l'aggiunta del dipendente.",
					'danger'
				);
			},
		});
	}

	resetForm() {
		this.nome = '';
		this.cognome = '';
		this.data_nascita = '';
		this.ruolo = '';
		this.email = '';
		this.foto = '';
		this.password = '';
		this.ref_filiale = undefined;
	}
}
