import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
	IonContent,
	IonCard,
	IonInput,
	IonButton,
	IonList,
	IonItem,
	ToastController,
	IonText,
	IonCardContent,
	IonGrid,
	IonCol,
	IonRow,
	IonImg,
} from '@ionic/angular/standalone';

import { NavController } from '@ionic/angular';

import { HttpClient } from '@angular/common/http';
import { FilialeService } from 'src/app/core/services/filiale.service';
import { FilialeInput } from 'src/app/core/interfaces/Filiale';
import { environment } from 'src/environments/environment';

@Component({
	selector: 'app-aggiungi-filiali',
	templateUrl: './aggiungi-filiali.page.html',
	styleUrls: ['./aggiungi-filiali.page.scss'],
	standalone: true,
	imports: [
		IonImg,
		IonRow,
		IonCol,
		IonGrid,
		IonCardContent,
		IonText,
		IonContent,
		CommonModule,
		FormsModule,
		IonCard,
		IonInput,
		IonButton,
		IonList,
		IonItem,
	],
})
export class AggiungiFilialiPage implements OnInit {
	// Campo per l'indirizzo della filiale
	indirizzo: string = '';
	// Campo per il comune della filiale
	comune: string = '';
	// Numero di tavoli disponibili nella filiale
	numTavoli: number | null = null;
	// Immagine in formato base64 per la filiale
	immagineBase64: string = '';
	// Lista di suggerimenti per l'indirizzo da OpenStreetMap
	suggestions: string[] = [];
	// Timeout per gestire la richiesta di suggerimenti con debounce
	timeout: any = null;

	constructor(
		private filialeService: FilialeService,
		private toastController: ToastController,
		private http: HttpClient,
		private router: NavController
	) {}

	/**
	 * Metodo chiamato all'inizializzazione del componente.
	 * Recupera i dati della filiale passati tramite stato di navigazione (se presenti)
	 * e li assegna ai relativi campi del form.
	 */
	ngOnInit() {
		// Recupera eventuali dati di filiale passati tramite stato di navigazione
		const navigation = window.history.state;
		if (navigation && navigation.filiale) {
			const f = navigation.filiale;
			this.indirizzo = f.indirizzo || '';
			this.comune = f.comune || '';
			this.numTavoli = f.num_tavoli ?? null;
			this.immagineBase64 = f.immagine || '';
		}
	}

	/**
	 * Gestisce la selezione di un file immagine da input file.
	 * Verifica che il file selezionato sia un'immagine valida.
	 * Converte il file immagine in una stringa Base64 e la assegna a `immagineBase64`.
	 * In caso di file non valido mostra un toast di avviso.
	 *
	 * @param event Evento di input file contenente il file selezionato.
	 */
	onFileSelected(event: any): void {
		const file = event.target.files[0];
		if (file && file.type.startsWith('image/')) {
			const reader = new FileReader();
			reader.onload = () => {
				this.immagineBase64 = reader.result as string;
			};
			reader.readAsDataURL(file);
		} else {
			this.presentToast('Seleziona un file immagine valido.', 'warning');
		}
	}

	/**
	 * Gestisce l'input sul campo indirizzo con debounce.
	 * Se l'indirizzo è lungo almeno 3 caratteri, esegue una chiamata
	 * all'API di TomTom per ottenere suggerimenti di indirizzi.
	 * Popola l'array `suggestions` con le possibili vie trovate.
	 * In caso di errore API, svuota i suggerimenti e logga l'errore.
	 */
	onIndirizzoInput(): void {
		clearTimeout(this.timeout);
		this.timeout = setTimeout(() => {
			if (this.indirizzo.trim().length < 3) {
				this.suggestions = [];
				return;
			}

			const query = `${this.indirizzo}, ${this.comune}`;
			const url = `https://api.tomtom.com/search/2/search/${encodeURIComponent(query)}.json?key=${environment.tomtomApiKey}&limit=2&countrySet=IT`;
			this.http.get<any>(url).subscribe(
				(res) => {
					this.suggestions = res.results.map((r: any) => {
						const via = r.address.streetName || '';
						const numero = r.address.streetNumber || '';
						return `${via}${numero ? ', ' + numero : ''}`;
					});
				},
				(err) => {
					console.error('❌ Errore API TomTom:', err);
					this.suggestions = [];
				}
			);
		}, 300); // debounce di 300ms per limitare le chiamate API
	}

	/**
	 * Imposta l'indirizzo selezionato dall'utente tra i suggerimenti
	 * e svuota la lista dei suggerimenti.
	 *
	 * @param s - La stringa dell'indirizzo selezionato
	 */
	selectSuggestion(s: string): void {
		this.indirizzo = s;
		this.suggestions = [];
	}

	/**
	 * Crea una nuova filiale verificando i campi obbligatori,
	 * ottenendo le coordinate geografiche tramite geocodifica
	 * e inviando i dati al servizio backend.
	 * In caso di successo resetta il form e naviga alla pagina di gestione filiali.
	 * Mostra toast di conferma o errore in base all'esito delle operazioni.
	 *
	 * @returns Promise<void>
	 */
	async creaFiliale(): Promise<void> {
		// Controlla che tutti i campi obbligatori siano compilati
		if (
			!this.indirizzo.trim() ||
			!this.comune.trim() ||
			this.numTavoli === null ||
			!this.immagineBase64
		) {
			this.presentToast('Compila tutti i campi obbligatori.', 'warning');
			return;
		}

		const fullAddress = `${this.indirizzo}, ${this.comune}`;
		try {
			// Ottiene le coordinate geografiche dall'indirizzo
			const coords = await this.geocodificaIndirizzo(fullAddress);
			if (!coords) {
				this.presentToast(
					'Indirizzo non trovato. Verifica e riprova.',
					'danger'
				);
				return;
			}

			// Prepara l'oggetto filiale da inviare al servizio backend
			const nuovaFiliale: FilialeInput = {
				indirizzo: this.indirizzo,
				comune: this.comune,
				num_tavoli: this.numTavoli,
				immagine: this.immagineBase64,
				latitudine: coords.lat,
				longitudine: coords.lon,
			};

			// Invio richiesta per aggiungere la filiale
			this.filialeService.addFiliale(nuovaFiliale).subscribe({
				next: async (res) => {
					if (res.success) {
						this.presentToast(
							'Filiale aggiunta con successo! 🎉',
							'success'
						);
						this.resetForm(); // Reset del form dopo il successo
						this.router.navigateBack(['/gestisci-filiali']);
					} else {
						this.presentToast(
							"Errore durante l'aggiunta della filiale.",
							'danger'
						);
					}
				},
				error: (err) => {
					console.error(err);
					this.presentToast('Errore di rete o server.', 'danger');
				},
			});
		} catch (error) {
			console.error(error);
			this.presentToast('Errore nel recupero coordinate.', 'danger');
		}
	}

	/**
	 * Effettua la geocodifica di un indirizzo tramite API TomTom,
	 * restituendo le coordinate geografiche (latitudine e longitudine).
	 * Se non si trovano risultati o in caso di errore, ritorna null.
	 *
	 * @param address - Indirizzo da geocodificare
	 * @returns Promise con oggetto contenente latitudine e longitudine oppure null
	 */
	async geocodificaIndirizzo(
		address: string
	): Promise<{ lat: number; lon: number } | null> {
		const url = `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(address)}.json?key=${environment.tomtomApiKey}&limit=1&countrySet=IT`;

		try {
			const res: any = await this.http.get(url).toPromise();
			if (res && res.results && res.results.length > 0) {
				const result = res.results[0];
				return {
					lat: parseFloat(result.position.lat),
					lon: parseFloat(result.position.lon),
				};
			}
			return null;
		} catch (err) {
			console.error('Errore geocoding con TomTom:', err);
			return null;
		}
	}

	/**
	 * Mostra un toast con un messaggio e colore specificato.
	 *
	 * @param message - Testo da visualizzare nel toast
	 * @param color - Colore del toast, può essere 'success', 'danger' o 'warning'
	 */
	async presentToast(
		message: string,
		color: 'success' | 'danger' | 'warning'
	) {
		const toast = await this.toastController.create({
			message,
			duration: 2500,
			position: 'top',
			color,
		});
		toast.present();
	}

	/**
	 * Resetta i campi del form azzerando i valori di indirizzo, comune,
	 * numero di tavoli, immagine in base64 e le eventuali suggerimenti
	 * di completamento automatico.
	 */
	resetForm(): void {
		this.indirizzo = '';
		this.comune = '';
		this.numTavoli = null;
		this.immagineBase64 = '';
		this.suggestions = [];
	}
}
