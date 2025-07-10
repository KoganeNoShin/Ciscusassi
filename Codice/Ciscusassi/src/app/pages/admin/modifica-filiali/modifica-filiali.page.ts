import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
	IonContent,
	IonCard,
	IonInput,
	IonButton,
	ToastController,
	IonList,
	IonItem,
	IonText,
	IonCardContent,
	IonGrid,
	IonCol,
	IonRow,
	IonImg,
} from '@ionic/angular/standalone';
import { FilialeService } from 'src/app/core/services/filiale.service';
import { FilialeInput } from 'src/app/core/interfaces/Filiale';
import { HttpClient } from '@angular/common/http';

import { NavController } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Component({
	selector: 'app-modifica-filiali',
	templateUrl: './modifica-filiali.page.html',
	styleUrls: ['./modifica-filiali.page.scss'],
	standalone: true,
	imports: [
		IonImg,
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
		IonRow,
	],
})
export class ModificaFilialiPage implements OnInit {
	filiale: any = {
		id_filiale: null,
		indirizzo: '',
		comune: '',
		num_tavoli: 0,
		immagine: '',
		latitudine: null,
		longitudine: null,
	};

	loading = false; // Stato caricamento per disabilitare pulsanti e mostrare loader
	suggerimenti: any[] = []; // Suggerimenti indirizzo per autocomplete
	showSuggerimenti = false; // Controlla visibilità lista suggerimenti

	constructor(
		private filialeService: FilialeService, // Servizio per chiamate API filiali
		private toastController: ToastController, // Per mostrare messaggi toast
		private http: HttpClient, // Per chiamate HTTP esterne (OpenStreetMap)
		private router: NavController
	) {}

	ngOnInit() {
		// Recupera la filiale passata tramite stato di navigazione (se presente)
		const navigation = window.history.state;
		if (navigation && navigation.filiale) {
			this.filiale = { ...navigation.filiale };
		}
	}

	/**
	 * Gestisce l'evento di selezione di un file immagine da parte dell'utente.
	 * 
	 * Se il file selezionato è un'immagine, viene letto e convertito in una stringa base64,
	 * che viene poi assegnata alla proprietà `immagine` dell'oggetto `filiale` per l'anteprima o il salvataggio.
	 * Se il file selezionato non è un'immagine valida, viene mostrato un messaggio di avviso tramite toast.
	 *
	 * @param event L'evento di selezione file generato dall'input di tipo file.
	 */
	onFileSelected(event: any): void {
		console.log('File selezionato:', event.target.files[0]); // Log per verificare se l'evento viene attivato
		// Gestione selezione file immagine e conversione in base64 per anteprima/salvataggio
		const file = event.target.files[0];
		if (file && file.type.startsWith('image/')) {
			const reader = new FileReader();
			reader.onload = () => {
				this.filiale.immagine = reader.result as string;
			};
			reader.readAsDataURL(file);
		} else {
			this.presentToast('Seleziona un file immagine valida.', 'warning');
		}
	}

	/**
	 * Cerca suggerimenti di indirizzi utilizzando l'API di TomTom in base all'indirizzo e al comune inseriti nella filiale.
	 *
	 * Costruisce una query combinando l'indirizzo e il comune della filiale, effettua una chiamata HTTP all'API TomTom
	 * e aggiorna la lista dei suggerimenti (`suggerimenti`) e la visibilità della lista (`showSuggerimenti`) in base ai risultati ottenuti.
	 * Se la query è troppo corta o la richiesta fallisce, la lista dei suggerimenti viene svuotata e nascosta.
	 *
	 * @remarks
	 * - Utilizza la chiave API di TomTom definita nell'environment.
	 * - Limita i risultati a 2 e filtra per l'Italia.
	 * - I suggerimenti includono nome visualizzato, indirizzo, latitudine e longitudine.
	 */
	cercaIndirizzo() {
		const query = `${this.filiale.indirizzo}, ${this.filiale.comune}`;

		if (!query || query.length < 3) {
			this.suggerimenti = [];
			this.showSuggerimenti = false;
			return;
		}

		const url = `https://api.tomtom.com/search/2/search/${encodeURIComponent(query)}.json?key=${environment.tomtomApiKey}&limit=2&countrySet=IT`;

		this.http.get<any>(url).subscribe(
			(res) => {
				this.suggerimenti = res.results.map((r: any) => {
					const via = r.address.streetName || '';
					const numero = r.address.streetNumber || '';
					const label = `${via}${numero ? ', ' + numero : ''}`;
					return {
						display_name: label,
						address: r.address,
						lat: parseFloat(r.position.lat),
						lon: parseFloat(r.position.lon),
					};
				});
				this.showSuggerimenti = this.suggerimenti.length > 0;
			},
			(err) => {
				console.error('❌ Errore API TomTom:', err);
				this.suggerimenti = [];
				this.showSuggerimenti = false;
			}
		);
	}

	/**
	 * Aggiorna i campi dell'oggetto `filiale` in base al suggerimento selezionato dall'utente.
	 *
	 * @param suggerimento Oggetto contenente le informazioni dell'indirizzo selezionato, 
	 *        tipicamente ottenuto da un servizio di suggerimenti (autocomplete).
	 *
	 * - Imposta l'indirizzo completo (`indirizzo`) con il valore di `display_name` del suggerimento.
	 * - Aggiorna il campo `comune` con il valore di `city`, `town` o `village` (in quest'ordine di priorità) se presenti.
	 * - Imposta le coordinate geografiche (`latitudine` e `longitudine`) convertendo i valori da stringa a numero.
	 * - Nasconde la lista dei suggerimenti e la svuota.
	 */
	selezionaIndirizzo(suggerimento: any) {
		// Al click su suggerimento, aggiorna i campi indirizzo, comune e coordinate
		this.filiale.indirizzo = suggerimento.display_name;
		if (suggerimento.address) {
			this.filiale.comune =
				suggerimento.address.city ||
				suggerimento.address.town ||
				suggerimento.address.village ||
				'';
		}
		this.filiale.latitudine = parseFloat(suggerimento.lat);
		this.filiale.longitudine = parseFloat(suggerimento.lon);

		this.showSuggerimenti = false;
		this.suggerimenti = [];
	}

	/**
	 * Aggiorna i dati di una filiale dopo aver validato i campi obbligatori e ottenuto le coordinate geografiche tramite geocoding.
	 *
	 * @remarks
	 * - Valida che tutti i campi obbligatori della filiale siano compilati.
	 * - Utilizza il servizio di geocodifica per ottenere latitudine e longitudine dall'indirizzo fornito.
	 * - Prepara l'oggetto di aggiornamento e invia la richiesta tramite il servizio `filialeService`.
	 * - Gestisce il feedback all'utente tramite toast e navigazione.
	 * - Gestisce eventuali errori di validazione, geocodifica o rete/server.
	 *
	 * @async
	 * @returns {Promise<void>} Nessun valore di ritorno.
	 */
	async modificaFiliale() {
		// Validazione campi obbligatori prima dell’invio
		if (
			!this.filiale.indirizzo?.trim() ||
			!this.filiale.comune?.trim() ||
			this.filiale.num_tavoli == null ||
			!this.filiale.immagine
		) {
			this.presentToast('Compila tutti i campi obbligatori.', 'warning');
			return;
		}

		this.loading = true;
		const fullAddress = `${this.filiale.indirizzo}, ${this.filiale.comune}`;

		try {
			// Ottieni lat/lon dall’indirizzo tramite geocoding
			const coords = await this.geocodificaIndirizzo(fullAddress);
			if (!coords) {
				this.presentToast(
					'Indirizzo non trovato. Verifica e riprova.',
					'danger'
				);
				this.loading = false;
				return;
			}

			// Prepara oggetto per aggiornamento
			const filialeUpdate: FilialeInput = {
				indirizzo: this.filiale.indirizzo,
				comune: this.filiale.comune,
				num_tavoli: this.filiale.num_tavoli,
				immagine: this.filiale.immagine,
				latitudine: coords.lat,
				longitudine: coords.lon,
			};

			// Chiamata API per aggiornare la filiale
			this.filialeService
				.updateFiliale(this.filiale.id_filiale, filialeUpdate)
				.subscribe({
					next: async (res) => {
						if (res.success) {
							this.presentToast(
								'Filiale aggiornata con successo! 🎉',
								'success'
							);
							this.router.navigateBack(['/gestisci-filiali']);
						} else {
							this.presentToast(
								"Errore durante l'aggiornamento.",
								'danger'
							);
						}
						this.loading = false;
					},
					error: async (err) => {
						console.error(err);
						this.presentToast('Errore di rete o server.', 'danger');
						this.loading = false;
					},
				});
		} catch (error) {
			console.error(error);
			this.presentToast('Errore nella geocodifica.', 'danger');
			this.loading = false;
		}
	}

	/**
	 * Esegue la geocodifica di un indirizzo utilizzando l'API TomTom e restituisce le coordinate geografiche corrispondenti.
	 *
	 * @param address L'indirizzo da geocodificare.
	 * @returns Un oggetto contenente latitudine (`lat`) e longitudine (`lon`) se la geocodifica ha successo, altrimenti `null`.
	 * @throws Restituisce `null` in caso di errore durante la richiesta HTTP o se non vengono trovati risultati.
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
	 * Mostra un toast di notifica con il messaggio e il colore specificati.
	 *
	 * @param message - Il messaggio da visualizzare nel toast.
	 * @param color - Il colore del toast ('success', 'danger' o 'warning').
	 * @returns Una Promise che si risolve quando il toast è stato presentato.
	 */
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
