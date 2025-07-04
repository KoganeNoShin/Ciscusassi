import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
	IonContent,
	IonCard,
	IonInput,
	IonButton,
	IonSelect,
	IonSelectOption,
	ToastController,
	IonText,
	IonCardContent,
	IonGrid,
	IonRow,
	IonCol,
	IonItem,
	IonImg,
} from '@ionic/angular/standalone';

import { ImpiegatoService } from 'src/app/core/services/impiegato.service';
import { FilialeService } from 'src/app/core/services/filiale.service';
import { ImpiegatoInput } from 'src/app/core/interfaces/Impiegato';
import { FilialeRecord } from 'src/app/core/interfaces/Filiale';
import { NavController } from '@ionic/angular';

@Component({
	selector: 'app-aggiungi-impegati',
	templateUrl: './aggiungi-impiegati.page.html',
	styleUrls: ['./aggiungi-impiegati.page.scss'],
	standalone: true,
	imports: [
		IonImg,
		IonCol,
		IonItem,
		IonRow,
		IonGrid,
		IonCardContent,
		IonContent,
		IonText,
		CommonModule,
		FormsModule,
		IonCard,
		IonInput,
		IonButton,
		IonSelect,
		IonSelectOption,
	],
})
export class AggiungiImpiegatiPage implements OnInit {
	// Proprietà legate al form per l'aggiunta di un dipendente
	nome: string = '';
	cognome: string = '';
	data_nascita: string = '';
	ruolo: string = '';
	email: string = '';
	foto: string = ''; // immagine in formato base64
	password: string = '';
	ref_filiale?: number; // riferimento alla filiale selezionata

	filiali: FilialeRecord[] = []; // elenco delle filiali disponibili

	constructor(
		private impiegatoService: ImpiegatoService,
		private filialeService: FilialeService,
		private toastController: ToastController,
		private router: NavController
	) {}

	// Metodo eseguito all'inizializzazione del componente
	ngOnInit() {
		this.caricaFiliali(); // carica le filiali da mostrare nel select
	}

	// Mostra un toast con messaggio e colore personalizzati
	async presentToast(message: string, color: string = 'success') {
		const toast = await this.toastController.create({
			message,
			duration: 2000,
			color,
			position: 'bottom',
		});
		await toast.present();
	}

	// Gestisce la selezione di un'immagine e la converte in base64
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

	// Validazione semplice per l'indirizzo email
	private isValidEmail(email: string): boolean {
		const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return re.test(email.toLowerCase());
	}

	// Carica le filiali da backend e le assegna alla proprietà 'filiali'
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

	// Metodo chiamato al submit del form per aggiungere un nuovo dipendente
	aggiungiImpiegato() {
		if (!this.isValidEmail(this.email)) {
			this.presentToast('Inserisci un indirizzo email valido.', 'danger');
			return;
		}

		if (!this.ref_filiale) {
			this.presentToast('Seleziona una filiale.', 'danger');
			return;
		}

		// Creazione dell'oggetto ImpiegatoInput con i dati inseriti
		const nuovoDipendente: ImpiegatoInput = {
			nome: this.nome,
			cognome: this.cognome,
			data_nascita: this.data_nascita,
			ruolo: this.ruolo,
			email: this.email,
			foto: this.foto,
			ref_filiale: this.ref_filiale,
		};

		// Invio al servizio per l'aggiunta del dipendente
		this.impiegatoService.AddImpiegato(nuovoDipendente).subscribe({
			next: (response) => {
				console.log('Dipendente aggiunto con successo:', response);
				this.presentToast(
					'Dipendente aggiunto con successo!',
					'success'
				);
				this.resetForm(); // resetta i campi del form dopo l'inserimento
				this.router.back();
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

	// Reset dei campi del form
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
