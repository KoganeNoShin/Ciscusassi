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
	IonLabel,
} from '@ionic/angular/standalone';

import { ImpiegatoService } from 'src/app/core/services/impiegato.service';
import { FilialeService } from 'src/app/core/services/filiale.service';
import { ImpiegatoInput } from 'src/app/core/interfaces/Impiegato';
import { FilialeRecord } from 'src/app/core/interfaces/Filiale';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';

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
		private router: NavController,
		private routerRouter: Router // per navigazione e recupero stato
	) {}

	// Metodo eseguito all'inizializzazione del componente
	ngOnInit() {
		const nav = this.routerRouter.getCurrentNavigation();
		const state = nav?.extras?.state as { filialeId?: number };

		if (state?.filialeId) {
			this.ref_filiale = state.filialeId;
			console.log('Filiale ricevuta:', this.ref_filiale);
		} else {
			console.error('Nessuna filiale ricevuta');
		}
		this.caricaFiliali(); // carica le filiali da mostrare nel select
	}

	// Mostra un toast con messaggio e colore personalizzati
	/**
	 * Mostra un toast con un messaggio specificato e un colore opzionale.
	 *
	 * @param message - Il messaggio da visualizzare nel toast.
	 * @param color - (Opzionale) Il colore del toast. Il valore predefinito è 'success'.
	 * @returns Una Promise che si risolve quando il toast è stato presentato.
	 */
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
	/**
	 * Gestisce la selezione di un'immagine da parte dell'utente.
	 *
	 * @param event L'evento generato dalla selezione di un file tramite input di tipo file.
	 * @remarks
	 * Se un file viene selezionato, il metodo utilizza un `FileReader` per leggerlo come Data URL
	 * e assegna il risultato alla proprietà `foto` della classe.
	 */
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
	/**
	 * Verifica se una stringa fornita è un indirizzo email valido.
	 *
	 * @param email - La stringa da validare come indirizzo email.
	 * @returns `true` se la stringa è un indirizzo email valido, altrimenti `false`.
	 */
	private isValidEmail(email: string): boolean {
		const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
		return re.test(email.toLowerCase());
	}

	// Carica le filiali da backend e le assegna alla proprietà 'filiali'
	/**
	 * Carica l'elenco delle filiali tramite il servizio `filialeService`.
	 * 
	 * Effettua una richiesta asincrona per ottenere le sedi disponibili.
	 * Se la risposta contiene dati, li assegna alla proprietà `filiali`.
	 * In caso di errore durante il caricamento, mostra un messaggio di errore tramite `presentToast`.
	 *
	 * @remarks
	 * Questo metodo viene tipicamente chiamato all'inizializzazione della pagina
	 * per popolare la lista delle filiali selezionabili.
	 */
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
	/**
	 * Aggiunge un nuovo dipendente dopo aver effettuato una serie di validazioni sui dati inseriti.
	 *
	 * - Verifica che l'email sia valida.
	 * - Controlla che sia stata selezionata una filiale.
	 * - Controlla che sia stata inserita una data di nascita valida e non futura.
	 * - Verifica che il dipendente sia maggiorenne (almeno 18 anni).
	 * - Crea un oggetto `ImpiegatoInput` con i dati forniti e lo invia al servizio per l'aggiunta.
	 * - Gestisce le risposte del servizio mostrando notifiche di successo o errore tramite toast.
	 *
	 * @remarks
	 * Mostra messaggi di errore specifici tramite toast in caso di dati mancanti, non validi o errori di backend.
	 *
	 * @returns {void}
	 */
	aggiungiImpiegato() {
		if (!this.isValidEmail(this.email)) {
			this.presentToast('Inserisci un indirizzo email valido.', 'danger');
			return;
		}

		if (!this.ref_filiale) {
			this.presentToast('Seleziona una filiale.', 'danger');
			return;
		}

		if (!this.data_nascita) {
			this.presentToast('Inserisci una data di nascita.', 'danger');
			return;
		}

		const oggi = new Date();
		const dataNascita = new Date(this.data_nascita);

		if (dataNascita > oggi) {
			this.presentToast(
				'La data di nascita non può essere futura.',
				'danger'
			);
			return;
		}

		// (Opzionale) Controllo maggiore età
		const anni = oggi.getFullYear() - dataNascita.getFullYear();
		const meseDiff = oggi.getMonth() - dataNascita.getMonth();
		const giornoDiff = oggi.getDate() - dataNascita.getDate();
		const eta =
			meseDiff < 0 || (meseDiff === 0 && giornoDiff < 0)
				? anni - 1
				: anni;

		if (eta < 18) {
			this.presentToast(
				'Il dipendente deve essere maggiorenne.',
				'danger'
			);
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
				this.resetForm();
				this.router.back();
			},
			error: (err) => {
				if (err.status === 400) {
					this.presentToast(
						"È necessario compilare tutti i campi e caricare un'immagine valida",
						'danger'
					);
				} else if(err.status === 500){
					this.presentToast(
						"Errore durante l'aggiunta del dipendente. Assicurati che il dipendente non esista già.",
						'danger'
					);
				}else {
					this.presentToast(
						"Errore durante l'aggiunta del dipendente. Riprova più tardi.",
						'danger'
					);
				}
			},
		});
	}

	// Reset dei campi del form
	/**
	 * @function
	 * Reimposta tutti i campi del modulo di aggiunta impiegato ai valori iniziali.
	 * 
	 * Questa funzione azzera i valori delle proprietà relative ai dati dell'impiegato,
	 * come nome, cognome, data di nascita, ruolo, email, foto, password e riferimento filiale.
	 * Utile per svuotare il modulo dopo l'inserimento o per annullare le modifiche effettuate.
	 */
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
