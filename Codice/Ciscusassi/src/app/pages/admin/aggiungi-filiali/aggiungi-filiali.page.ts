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
import { HttpClient } from '@angular/common/http';
import { FilialeService } from 'src/app/core/services/filiale.service';
import { FilialeInput } from 'src/app/core/interfaces/Filiale';

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
		private http: HttpClient
	) {}

	// Metodo eseguito all'inizializzazione del componente
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

	// Gestisce la selezione di un file immagine e lo converte in base64
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

	// Gestisce l'input sull'indirizzo per mostrare suggerimenti (autocomplete)
	onIndirizzoInput(): void {
		clearTimeout(this.timeout);
		this.timeout = setTimeout(() => {
			if (this.indirizzo.trim().length < 3) {
				this.suggestions = [];
				return;
			}

			const query = `${this.indirizzo}, ${this.comune}`;
			this.http
				.get<
					any[]
				>(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`)
				.subscribe(
					(res) => {
						// Mappa la risposta per ottenere solo i nomi da mostrare come suggerimenti
						this.suggestions = res.map((item) => item.display_name);
					},
					(err) => {
						console.error('Errore durante il suggerimento:', err);
						this.suggestions = [];
					}
				);
		}, 300); // debounce di 300ms per limitare le chiamate API
	}

	// Seleziona un suggerimento e aggiorna il campo indirizzo, svuotando i suggerimenti
	selectSuggestion(s: string): void {
		this.indirizzo = s;
		this.suggestions = [];
	}

	// Crea una nuova filiale, validando i dati e ottenendo coordinate tramite geocoding
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

	// Funzione per ottenere le coordinate geografiche tramite OpenStreetMap Nominatim
	async geocodificaIndirizzo(
		address: string
	): Promise<{ lat: number; lon: number } | null> {
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

	// Mostra un toast con messaggio e colore specifico
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

	// Resetta tutti i campi del form e svuota i suggerimenti
	resetForm(): void {
		this.indirizzo = '';
		this.comune = '';
		this.numTavoli = null;
		this.immagineBase64 = '';
		this.suggestions = [];
	}
}
