import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
	IonContent,
	IonHeader,
	IonTitle,
	IonToolbar,
	IonChip,
	IonInput,
	IonButton,
	IonIcon,
	IonAlert,
	IonCard,
	IonImg,
	IonCardHeader,
	IonCardTitle,
	IonCardContent,
} from '@ionic/angular/standalone';

import { ToastController } from '@ionic/angular';

import { ApiResponse } from 'src/app/core/interfaces/ApiResponse';
import { ImpiegatoRecord } from 'src/app/core/interfaces/Impiegato';
import { ImpiegatoService } from 'src/app/core/services/impiegato.service';

@Component({
	selector: 'app-modifica-dipendenti',
	templateUrl: './modifica-dipendenti.page.html',
	styleUrls: ['./modifica-dipendenti.page.scss'],
	standalone: true,
	imports: [
		IonContent,
		RouterLink,
		IonHeader,
		IonTitle,
		IonButton,
		IonToolbar,
		CommonModule,
		FormsModule,
		IonChip,
		IonInput,
		IonAlert,
		IonButton,
		IonIcon,
		IonCard,
		IonImg,
		IonCardHeader,
		IonCardTitle,
		IonCardContent,
	],
})
export class ModificaDipendentiPage implements OnInit {
	dipendenti: ImpiegatoRecord[] = []; // Lista completa di dipendenti caricata da API
	loading: boolean = true; // Flag per indicare caricamento dati
	error: boolean = false; // Flag per indicare errore caricamento
	selectedCategoria: string = 'Tutti'; // Categoria filtro selezionata (Ruolo dipendente)
	searchTerm: string = ''; // Termini di ricerca inseriti dall’utente
	filteredDipendenti: ImpiegatoRecord[] = []; // Lista filtrata in base a categoria e ricerca
	id_filiale: number = 0; // ID della filiale da cui caricare i dipendenti

	isAlertOpen = false; // Controlla apertura alert conferma eliminazione
	selectedDipendente: ImpiegatoRecord | null = null; // Dipendente selezionato per azioni (es. eliminazione)

	constructor(
		private impiegatoService: ImpiegatoService, // Servizio per chiamate API dipendenti
		private route: ActivatedRoute, // Per leggere parametri query string da URL
		private router: Router, // Per gestione navigazione e stato
		private toastController: ToastController // Per mostrare messaggi toast all’utente
	) {}

	ngOnInit() {
		// Sottoscrizione ai parametri query per ottenere id_filiale
		this.route.queryParams.subscribe((params) => {
			const idFromQuery = +params['id_filiale'] || 0;
			if (idFromQuery) {
				// Se id_filiale è presente nei parametri, lo utilizziamo per caricare i dipendenti
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
						'ID filiale non passato alla pagina modifica dipendenti.'
					);
				}
			}
		});
	}

	private fetchImpiegati(filialeId: number) {
		// Chiamata API per ottenere i dipendenti di una filiale
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
		if (response.success && response.data) {
			this.dipendenti = response.data; // Salvo i dipendenti ricevuti
			this.filterTutti(); // Inizializzo lista filtrata con tutti i dipendenti
		} else {
			// In caso di errore nella risposta API
			console.error(response.message || 'Errore sconosciuto');
			this.error = true;
		}

		this.loading = false; // Finito caricamento dati
	}

	filterAmministratori() {
		// Filtro per ruolo Amministratore
		this.selectedCategoria = 'Amministratori';
		this.filteredDipendenti = this.dipendenti.filter(
			(p) => p.ruolo === 'Amministratore'
		);
	}

	filterCamerieri() {
		// Filtro per ruolo Cameriere
		this.selectedCategoria = 'camerieri';
		this.filteredDipendenti = this.dipendenti.filter(
			(p) => p.ruolo === 'Cameriere'
		);
	}

	filterChef() {
		// Filtro per ruolo Chef
		this.selectedCategoria = 'Chef';
		this.filteredDipendenti = this.dipendenti.filter(
			(p) => p.ruolo === 'Chef'
		);
	}

	filterTutti() {
		// Mostra tutti i dipendenti senza filtri di ruolo
		this.selectedCategoria = 'Tutti';
		this.filteredDipendenti = this.dipendenti;
	}

	applyFilters() {
		// Applica filtri combinati (categoria + ricerca testo)
		const categoria = this.selectedCategoria.toLowerCase();
		const term = this.searchTerm.trim().toLowerCase();

		this.filteredDipendenti = this.dipendenti.filter((p) => {
			const ruolo = p.ruolo?.toLowerCase() || '';
			const nomeCompleto = `${p.nome} ${p.cognome}`.toLowerCase();
			const email = p.email?.toLowerCase() || '';

			// Verifica se il dipendente corrisponde alla categoria o se è 'tutti'
			const matchCategoria = categoria === 'tutti' || ruolo === categoria;
			// Verifica se la ricerca testuale è contenuta nel nome completo o email
			const matchSearch =
				nomeCompleto.includes(term) || email.includes(term);

			return matchCategoria && matchSearch;
		});
	}

	showAlert(dipendente: ImpiegatoRecord) {
		// Mostra alert conferma eliminazione per il dipendente selezionato
		this.selectedDipendente = dipendente;
		this.isAlertOpen = true;
	}

	onConfirm() {
		// Azione conferma eliminazione dipendente
		if (this.selectedDipendente) {
			const matricolaToDelete = this.selectedDipendente.matricola;

			// Rimozione ottimistica dalla lista visualizzata
			this.dipendenti = this.dipendenti.filter(
				(d) => d.matricola !== matricolaToDelete
			);
			this.applyFilters(); // Aggiorna lista filtrata dopo rimozione

			// Chiamata API per eliminare il dipendente lato server
			this.impiegatoService.DeleteImpiegato(matricolaToDelete).subscribe({
				next: () => {
					// Notifica successo eliminazione
					this.showToastMessage(
						'Dipendente eliminato con successo',
						'success'
					);
				},
				error: (err) => {
					// Gestione errore eliminazione: log e notifica all’utente
					console.error('Errore durante la cancellazione:', err);
					this.showToastMessage(
						'Errore durante la cancellazione',
						'danger'
					);
				},
			});
		}
		this.isAlertOpen = false; // Chiudo alert
		this.selectedDipendente = null; // Reset dipendente selezionato
	}

	onCancel() {
		// Azione annulla eliminazione (chiusura alert)
		this.isAlertOpen = false;
		this.selectedDipendente = null;
	}

	alertButtons = [
		{
			text: 'Annulla',
			role: 'cancel',
			handler: () => this.onCancel(),
		},
		{
			text: 'OK',
			role: 'confirm',
			handler: () => this.onConfirm(),
		},
	];

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
