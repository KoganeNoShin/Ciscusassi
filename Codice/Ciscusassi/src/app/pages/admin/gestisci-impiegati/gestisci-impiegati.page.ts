import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
	IonContent,
	IonChip,
	IonButton,
	IonIcon,
	IonText,
	IonSearchbar,
	IonSpinner,
	AlertController,
} from '@ionic/angular/standalone';

import { ToastController } from '@ionic/angular';

import { ApiResponse } from 'src/app/core/interfaces/ApiResponse';
import { ImpiegatoRecord } from 'src/app/core/interfaces/Impiegato';
import { ImpiegatoService } from 'src/app/core/services/impiegato.service';

import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';
import { ImpiegatoAmministratoreComponent } from 'src/app/components/impiegato-amministratore/impiegato-amministratore.component';

@Component({
	selector: 'app-gestisci-impiegati',
	templateUrl: './gestisci-impiegati.page.html',
	styleUrls: ['./gestisci-impiegati.page.scss'],
	standalone: true,
	imports: [
		ImpiegatoAmministratoreComponent,
		IonText,
		IonContent,
		RouterLink,
		IonButton,
		CommonModule,
		FormsModule,
		IonChip,
		IonIcon,
		IonSearchbar,
		IonSpinner,
	],
})
export class GestisciImpiegatiPage implements OnInit {
	impiegati: ImpiegatoRecord[] = []; // Lista completa di impiegati caricata da API
	loading: boolean = true; // Flag per indicare caricamento dati
	error: boolean = false; // Flag per indicare errore caricamento
	ruoloSelezionato: string = 'Tutti'; // ruoloSelezionato filtro selezionata (Ruolo impieagato)
	searchTerm: string = ''; // Termini di ricerca inseriti dall’utente
	impiegatiFiltrati: ImpiegatoRecord[] = []; // Lista filtrata in base a ruoloSelezionato e ricerca
	id_filiale: number = 0; // ID della filiale da cui caricare i impiegati

	isAlertOpen = false; // Controlla apertura alert conferma eliminazione
	selectedImpiegato: ImpiegatoRecord | null = null; // impieagato selezionato per azioni (es. eliminazione)

	constructor(
		private impiegatoService: ImpiegatoService, // Servizio per chiamate API impiegati
		private route: ActivatedRoute, // Per leggere parametri query string da URL
		private router: Router, // Per gestione navigazione e stato
		private toastController: ToastController, // Per mostrare messaggi toast all’utente
		private alertController: AlertController
	) {
		addIcons({ add });
	}

	ngOnInit() {
		// Sottoscrizione ai parametri query per ottenere id_filiale
		this.route.queryParams.subscribe((params) => {
			const idFromQuery = +params['id_filiale'] || 0;
			if (idFromQuery) {
				// Se id_filiale è presente nei parametri, lo utilizziamo per caricare i impiegati
				this.id_filiale = idFromQuery;
				this.fetchImpiegati(this.id_filiale);
			} else {
				// Altrimenti proviamo a recuperarlo dallo stato della navigazione (es. passaggio di dati tramite router)
				const navState = this.router.getCurrentNavigation()?.extras
					?.state as { filialeId?: number };
				if (navState?.filialeId) {
					this.id_filiale = navState.filialeId;
					this.fetchImpiegati(this.id_filiale);
				} else {
					// Se non è disponibile, segnaliamo errore e interrompiamo caricamento
					this.loading = false;
					this.error = true;
					console.error(
						'ID filiale non passato alla pagina modifica impiegati.'
					);
				}
			}
		});
	}

	private fetchImpiegati(filialeId: number) {
		// Chiamata API per ottenere i impiegati di una filiale
		this.impiegatoService.GetImpiegati(filialeId).subscribe({
			next: (response) => this.handleResponse(response),
			error: (err) => {
				// Gestione errore chiamata API
				console.error(err);
				this.loading = false;
				this.error = true;
			},
		});
	}

	private handleResponse(response: ApiResponse<ImpiegatoRecord[]>): void {
		// Gestione risposta API
		if (response.success) {
			if (response.data) {
				this.impiegati = response.data; // Salvo i impiegati ricevuti
			}

			this.filterByRuolo('Tutti'); // Inizializzo lista filtrata con tutti i impiegati
			console.log(this.impiegati);
		} else {
			// In caso di errore nella risposta API
			console.error(response.message || 'Errore sconosciuto');
			this.error = true;
		}

		this.loading = false; // Finito caricamento dati
	}

	// Funzione che applica il filtro in base alla ruoloSelezionato
	filterByRuolo(ruolo: string) {
		// Imposta la ruoloSelezionato selezionata
		this.ruoloSelezionato = ruolo;

		// Se la ruoloSelezionato è "Tutti", mostriamo tutti i piatti
		if (ruolo === 'Tutti') {
			this.impiegatiFiltrati = this.impiegati;
		}
		// Se la ruoloSelezionato è una ruoloSelezionato specifica, filtriamo per quella ruoloSelezionato
		else {
			this.impiegatiFiltrati = this.impiegati.filter(
				(d) => d.ruolo === ruolo
			);
		}
	}

	applyFilters() {
		// Applica filtri combinati (ruoloSelezionato + ricerca testo)
		const ruoloSelezionato = this.ruoloSelezionato.toLowerCase();
		const term = this.searchTerm.trim().toLowerCase();

		this.impiegatiFiltrati = this.impiegati.filter((p) => {
			const ruolo = p.ruolo?.toLowerCase() || '';
			const nomeCompleto = `${p.nome} ${p.cognome}`.toLowerCase();
			const email = p.email?.toLowerCase() || '';

			// Verifica se il impieagato corrisponde alla ruoloSelezionato o se è 'tutti'
			const matchRuoloSelezionato =
				ruoloSelezionato === 'tutti' || ruolo === ruoloSelezionato;
			// Verifica se la ricerca testuale è contenuta nel nome completo o email
			const matchSearch =
				nomeCompleto.includes(term) || email.includes(term);

			return matchRuoloSelezionato && matchSearch;
		});
	}

	async showAlertDeleteImpiegato(impieagato: ImpiegatoRecord) {
		// Mostra alert conferma eliminazione per l' impieagato selezionato
		this.selectedImpiegato = impieagato;
		this.isAlertOpen = true;

		const alert = await this.alertController.create({
			header: 'Conferma cancellazione',
			message: `Sei sicuro di voler licenziare ${this.selectedImpiegato.nome} ${this.selectedImpiegato.cognome}?`,
			buttons: [
				{
					text: 'Annulla',
					role: 'cancel',
					handler: async () => {
						this.annullaEliminaImpiegato();
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
						this.confermaEliminaImpiegato();
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

	confermaEliminaImpiegato() {
		// Azione conferma eliminazione impieagato
		if (this.selectedImpiegato) {
			const matricolaToDelete = this.selectedImpiegato.matricola;

			// Rimozione ottimistica dalla lista visualizzata
			this.impiegati = this.impiegati.filter(
				(d) => d.matricola !== matricolaToDelete
			);
			this.applyFilters(); // Aggiorna lista filtrata dopo rimozione

			// Chiamata API per eliminare il impieagato lato server
			this.impiegatoService.DeleteImpiegato(matricolaToDelete).subscribe({
				next: () => {
					// Notifica successo eliminazione
					this.showToastMessage(
						'impieagato licenziato con successo',
						'success'
					);
				},
				error: (err) => {
					// Gestione errore eliminazione: log e notifica all’utente
					console.error('Errore durante il licenziamento:', err);
					this.showToastMessage(
						'Errore durante il licenziamento',
						'danger'
					);
				},
			});
		}
		this.isAlertOpen = false; // Chiudo alert
		this.selectedImpiegato = null; // Reset impieagato selezionato
	}

	annullaEliminaImpiegato() {
		// Azione annulla eliminazione (chiusura alert)
		this.isAlertOpen = false;
		this.selectedImpiegato = null;
	}

	private async showToastMessage(
		message: string,
		color: 'success' | 'danger'
	) {
		// Mostra un messaggio toast all’utente con colore e icona personalizzati
		const toast = await this.toastController.create({
			message,
			duration: 2000,
			color,
			position: 'top',
			animated: true,
			icon: color === 'success' ? 'checkmark-circle' : 'alert-circle',
		});
		await toast.present();
	}
}
