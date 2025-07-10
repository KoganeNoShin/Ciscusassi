import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
	IonContent,
	IonButton,
	IonIcon,
	ToastController,
	IonSearchbar,
	IonText,
	IonSpinner,
} from '@ionic/angular/standalone';
import { FilialeService } from 'src/app/core/services/filiale.service';
import { FilialeRecord } from 'src/app/core/interfaces/Filiale';
import { RouterModule, Router } from '@angular/router';
import { ApiResponse } from 'src/app/core/interfaces/ApiResponse';
import { FilialeAmministratoreComponent } from 'src/app/components/filiale-amministratore/filiale-amministratore.component';

import { AlertController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';

@Component({
	selector: 'app-gestisci-filiali',
	templateUrl: './gestisci-filiali.page.html',
	styleUrls: ['./gestisci-filiali.page.scss'],
	standalone: true,
	imports: [
		IonText,
		IonContent,
		RouterModule,
		FilialeAmministratoreComponent,
		CommonModule,
		FormsModule,
		IonSearchbar,
		IonButton,
		IonIcon,
		IonSpinner,
	],
})
export class GestisciFilialiPage implements OnInit {
	// Lista completa delle filiali
	filiali: FilialeRecord[] = [];
	// Lista filtrata in base a ricerca/filtri
	filialiFiltered: FilialeRecord[] = [];
	loading: boolean = true; // Stato caricamento dati
	error: boolean = false; // Stato errore caricamento
	searchTerm: string = ''; // Term di ricerca
	selectedCategoria: string = 'Tutte'; // Categoria selezionata per filtro

	isAlertOpen = false; // Stato alert di conferma eliminazione
	selectedFiliale: FilialeRecord | null = null; // Filiale selezionata per azioni

	constructor(
		private filialeService: FilialeService,
		private toastController: ToastController,
		private alertController: AlertController,
		private router: Router
	) {
		addIcons({ add });
	}

	/**
	 * Metodo Angular chiamato all'inizializzazione del componente.
	 *
	 * @remarks
	 * - Recupera tutte le filiali tramite il servizio `filialeService`.
	 * - Gestisce la risposta con il metodo `handleResponse`.
	 * - In caso di errore, registra l'errore in console,
	 *   disabilita lo stato di caricamento e imposta il flag di errore.
	 */
	ngOnInit() {
		// Recupera tutte le filiali da backend
		this.filialeService.GetSedi().subscribe({
			next: (response) => this.handleResponse(response),
			error: (err) => {
				console.log(err);
				this.loading = false;
				this.error = true;
			},
		});
	}

	/**
	 * Gestisce la risposta ricevuta dal backend per il caricamento delle filiali.
	 *
	 * @param response - La risposta ricevuta, di tipo `ApiResponse` contenente un array di `FilialeRecord`.
	 *
	 * @remarks
	 * - Se la risposta è positiva e contiene dati, aggiorna la lista delle filiali
	 *   e applica i filtri correnti.
	 * - In caso contrario, registra un errore sulla console e imposta il flag di errore.
	 * - Imposta lo stato di caricamento a false al termine dell'elaborazione.
	 */
	private handleResponse(response: ApiResponse<FilialeRecord[]>): void {
		if (response.success && response.data) {
			this.filiali = response.data;
			this.applyFilters();
		} else {
			console.error(response.message || 'Errore sconosciuto');
			this.error = true;
		}
		this.loading = false;
	}

	/**
	 * Applica il filtro di ricerca sulle filiali in base al termine inserito.
	 *
	 * @remarks
	 * - Filtra l'array `filiali` per includere solo quelle il cui indirizzo
	 *   contiene il termine di ricerca (case insensitive).
	 * - Il risultato filtrato viene salvato in `filialiFiltered`.
	 */
	applyFilters() {
		const term = this.searchTerm.trim().toLowerCase();
		this.filialiFiltered = this.filiali.filter((f) =>
			f.indirizzo?.toLowerCase().includes(term)
		);
	}

	/**
	 * Resetta il filtro categoria e ricerca, mostrando tutte le filiali.
	 *
	 * @remarks
	 * - Imposta la categoria selezionata a 'Tutte'.
	 * - Pulisce il termine di ricerca.
	 * - Copia tutte le filiali nell'array filtrato `filialiFiltered`.
	 */
	filterTutti() {
		this.selectedCategoria = 'Tutte';
		this.searchTerm = '';
		this.filialiFiltered = [...this.filiali];
	}

	/**
	 * Mostra un alert di conferma per cancellare una filiale.
	 *
	 * @param filiale - La filiale da eliminare, utilizzata per mostrare l'indirizzo nell'alert.
	 *
	 * @remarks
	 * - Imposta la filiale selezionata per la cancellazione.
	 * - Mostra un alert con due opzioni:
	 *   - "Annulla": richiama il metodo `cancellaEliminaFiliale`.
	 *   - "Conferma": richiama il metodo `confermaEliminaFiliale`.
	 * - Personalizza lo stile dei pulsanti e dell'alert.
	 */
	async showAlertDeleteFiliale(filiale: FilialeRecord) {
		this.selectedFiliale = filiale;
		this.isAlertOpen = true;

		const alert = await this.alertController.create({
			header: 'Conferma cancellazione',
			message: `Sei sicuro di voler cancellare la filiale ${this.selectedFiliale.indirizzo}?`,
			buttons: [
				{
					text: 'Annulla',
					role: 'cancel',
					handler: async () => {
						this.cancellaEliminaFiliale();
					},
					cssClass: [
						'alert-button-cancel',
						'bg-color-rosso',
						'text-color-bianco',
					],
				},
				{
					text: 'Conferma',
					handler: async () => {
						this.confermaEliminaFiliale();
					},
					cssClass: [
						'alert-button-confirm',
						'bg-color-verdechiaro',
						'text-color-bianco',
					],
				},
			],
			cssClass: ['custom-alert', 'text-color-bianco'],
		});

		await alert.present();
	}

	/**
	 * Conferma e gestisce la cancellazione della filiale selezionata.
	 *
	 * @remarks
	 * - Verifica che una filiale sia selezionata.
	 * - Chiama il servizio per eliminare la filiale tramite il suo ID.
	 * - In caso di successo:
	 *   - Rimuove la filiale eliminata dalla lista locale.
	 *   - Applica i filtri aggiornati alla lista.
	 *   - Mostra un toast di conferma successo.
	 * - In caso di errore o risposta negativa:
	 *   - Mostra un toast di errore.
	 * - Reset dello stato di alert e filiale selezionata.
	 */
	async confermaEliminaFiliale() {
		if (this.selectedFiliale) {
			const id = this.selectedFiliale.id_filiale;
			this.filialeService.deleteFiliale(id).subscribe({
				next: async (res) => {
					if (res.success) {
						// Rimuove filiale dalla lista locale
						this.filiali = this.filiali.filter(
							(f) => f.id_filiale !== id
						);
						this.applyFilters();
						await this.presentToast(
							'Filiale eliminata con successo',
							'success'
						);
					} else {
						await this.presentToast(
							"Errore durante l'eliminazione della filiale",
							'danger'
						);
					}
				},
				error: async (err) => {
					console.error('Errore eliminazione:', err);
					await this.presentToast(
						"Errore di rete durante l'eliminazione",
						'danger'
					);
				},
			});
		}
		this.isAlertOpen = false;
		this.selectedFiliale = null;
	}

	/**
	 * Annulla l'eliminazione della filiale.
	 *
	 * @remarks
	 * Chiude la finestra di conferma e resetta la filiale selezionata.
	 */
	cancellaEliminaFiliale() {
		this.isAlertOpen = false;
		this.selectedFiliale = null;
	}

	/**
	 * Naviga alla pagina di modifica filiale passando la filiale selezionata.
	 *
	 * @param filiale - L'oggetto FilialeRecord da modificare.
	 */
	modificaFiliale(filiale: FilialeRecord) {
		this.router.navigate(['/modifica-filiali'], { state: { filiale } });
	}

	/**
	 * Mostra un toast con un messaggio e un colore specificato.
	 *
	 * @param message - Il messaggio da visualizzare nel toast.
	 * @param color - Il colore del toast, può essere 'success' o 'danger'.
	 */
	async presentToast(message: string, color: 'success' | 'danger') {
		const toast = await this.toastController.create({
			message,
			duration: 2500,
			position: 'top',
			color,
		});
		await toast.present();
	}
}
