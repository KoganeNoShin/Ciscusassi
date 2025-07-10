import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
	IonContent,
	IonButton,
	IonCard,
	IonInput,
	IonSelect,
	IonSelectOption,
	ToastController,
	IonText,
	IonCardContent,
	IonGrid,
	IonCol,
	IonRow,
	IonImg,
	IonItem,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';

import { FilialeService } from 'src/app/core/services/filiale.service';
import { ImpiegatoService } from 'src/app/core/services/impiegato.service';
import { FilialeRecord } from 'src/app/core/interfaces/Filiale';
import { ImpiegatoData } from 'src/app/core/interfaces/Impiegato';
import { NavController } from '@ionic/angular';

@Component({
	selector: 'app-modifica-impiegati', // nome componente per il template
	templateUrl: './modifica-impiegati.page.html', // file html associato
	styleUrls: ['./modifica-impiegati.page.scss'], // file css/scss associato
	standalone: true, // componente standalone, non in un modulo Angular tradizionale
	imports: [
		IonItem,
		IonImg,
		IonRow,
		IonCol,
		IonGrid,
		IonCardContent,
		IonContent,
		IonButton,
		IonCard,
		IonInput,
		CommonModule,
		IonText,
		FormsModule,
		IonSelect,
		IonSelectOption,
	],
})
export class ModificaImpiegatiPage implements OnInit {
	// proprietà che contengono i dati del dipendente
	nome: string = '';
	cognome: string = '';
	dataNascita: string = '';
	ruolo: string = '';
	foto: string = ''; // stringa base64 dell'immagine profilo
	ref_filiale!: number; // id filiale di riferimento
	matricola!: number; // id univoco dipendente

	filiali: FilialeRecord[] = []; // elenco filiali caricate dal servizio

	constructor(
		private router: Router, // router per navigazione e recupero dati passati
		private filialeService: FilialeService, // servizio per filiali
		private impiegatoService: ImpiegatoService, // servizio per dipendenti
		private toastController: ToastController, // per messaggi toast a schermo
		private navigator: NavController
	) {}

	ngOnInit() {
		// qui recuperiamo i dati del dipendente passati tramite navigation state
		const navigation = this.router.getCurrentNavigation();
		if (
			navigation?.extras?.state &&
			navigation.extras.state['dipendente']
		) {
			const dip = navigation.extras.state['dipendente'];
			console.log(dip);
			this.matricola = dip.matricola; // matricola obbligatoria per update
			this.nome = dip.nome || ''; // assegno nome o stringa vuota se mancante
			this.cognome = dip.cognome || '';
			this.dataNascita = dip.data_nascita || ''; // gestisco possibili nomi diversi
			this.ruolo = dip.ruolo || '';
			this.foto = dip.foto || dip.image || ''; // immagine, base64 o url
			this.ref_filiale = dip.ref_filiale; // id filiale associata
		} else {
			console.warn(
				'Nessun dipendente trovato nello stato della navigazione'
			);
		}
		this.caricaFiliali(); // carico le filiali dal server per la select
	}

	/**
	 * Carica l'elenco delle filiali tramite il servizio `filialeService`.
	 * 
	 * Effettua una richiesta asincrona per ottenere le sedi disponibili.
	 * Se la risposta contiene dati, li assegna alla proprietà `filiali`.
	 * In caso di errore durante il caricamento, mostra un messaggio di errore all'utente tramite `presentToast`.
	 *
	 * @returns {void}
	 */
	caricaFiliali() {
		this.filialeService.GetSedi().subscribe({
			next: (res) => {
				if (res.data) {
					this.filiali = res.data; // salvo le filiali ricevute
				}
			},
			error: (err) => {
				console.error('Errore caricamento filiali:', err);
				this.presentToast(
					'Errore nel caricamento delle filiali.',
					'danger'
				); // messaggio errore all'utente
			},
		});
	}

	// funzione generica per mostrare un toast (popup breve) in basso
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

	// evento quando viene selezionato un file (foto)
	/**
	 * Gestisce l'evento di selezione di un file da parte dell'utente.
	 * 
	 * @param event L'evento generato dalla selezione del file (tipicamente da un input di tipo file).
	 * 
	 * Se un file viene selezionato, il metodo utilizza un FileReader per convertirlo in una stringa base64
	 * e assegna il risultato alla variabile `foto`.
	 */
	onFileSelected(event: any) {
		const file = event.target.files[0]; // prendo il primo file selezionato
		if (file) {
			const reader = new FileReader(); // reader per convertire file in base64
			reader.onload = () => {
				this.foto = reader.result as string; // salvo la stringa base64 nella variabile foto
			};
			reader.readAsDataURL(file); // avvio la conversione
		}
	}

	// chiamata al salvataggio modifiche
	/**
	 * Salva le modifiche apportate ai dati di un impiegato.
	 *
	 * Questa funzione esegue una serie di controlli sui campi obbligatori:
	 * - Verifica che la matricola sia presente.
	 * - Verifica che una filiale sia selezionata.
	 * - Verifica che tutti i campi obbligatori (nome, cognome, data di nascita, ruolo) siano compilati.
	 *
	 * Se tutti i controlli vengono superati, prepara i dati modificati e invia una richiesta HTTP
	 * al servizio per aggiornare le informazioni dell'impiegato. Mostra un messaggio di successo
	 * o di errore tramite toast a seconda dell'esito dell'operazione.
	 */
	salvaModifiche() {
		// controllo matricola (non deve essere undefined)
		if (!this.matricola) {
			this.presentToast(
				'Errore: matricola dipendente non trovata.',
				'danger'
			);
			return;
		}

		// controllo che una filiale sia selezionata
		if (!this.ref_filiale) {
			this.presentToast('Seleziona una filiale.', 'danger');
			return;
		}

		// controllo che tutti i campi obbligatori siano compilati
		if (!this.nome || !this.cognome || !this.dataNascita || !this.ruolo) {
			this.presentToast('Completa tutti i campi obbligatori.', 'danger');
			return;
		}

		// preparo i dati da inviare al backend
		const datiModificati: ImpiegatoData = {
			nome: this.nome,
			cognome: this.cognome,
			data_nascita: this.dataNascita,
			ruolo: this.ruolo,
			foto: this.foto,
			ref_filiale: this.ref_filiale,
		};

		// chiamata HTTP al servizio per aggiornare il dipendente
		this.impiegatoService
			.UpdateImpiegato(this.matricola, datiModificati)
			.subscribe({
				next: (res) => {
					console.log('Impiegato aggiornato con successo:', res);
					this.presentToast(
						'Impiegato aggiornato con successo!',
						'success'
					);
					this.navigator.back();
				},
				error: (err) => {
					console.error('Errore aggiornamento dipendente:', err);
					this.presentToast(
						"Errore durante l'aggiornamento del dipendente.",
						'danger'
					);
				},
			});
	}
}
