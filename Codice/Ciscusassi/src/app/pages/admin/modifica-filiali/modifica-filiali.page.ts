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

	cercaIndirizzo(event: any) {
		// Richiesta suggerimenti indirizzo via OpenStreetMap se input >=3 caratteri
		const query = event.target.value;
		if (!query || query.length < 3) {
			this.suggerimenti = [];
			this.showSuggerimenti = false;
			return;
		}

		const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
			query
		)}&addressdetails=1&limit=5`;

		this.http.get<any[]>(url).subscribe(
			(results) => {
				this.suggerimenti = results;
				this.showSuggerimenti = results.length > 0;
			},
			(error) => {
				console.error('Errore suggerimenti:', error);
				this.suggerimenti = [];
				this.showSuggerimenti = false;
			}
		);
	}

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

	async geocodificaIndirizzo(
		address: string
	): Promise<{ lat: number; lon: number } | null> {
		// Funzione di geocodifica chiamando OpenStreetMap per ottenere lat/lon da indirizzo
		const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
			address
		)}`;
		try {
			const res: any = await this.http.get(url).toPromise();
			if (res && res.length > 0) {
				return {
					lat: parseFloat(res[0].lat),
					lon: parseFloat(res[0].lon),
				};
			}
			return null;
		} catch (err) {
			console.error('Errore geocoding:', err);
			return null;
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
