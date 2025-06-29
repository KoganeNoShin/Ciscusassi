import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
	IonCard,
	IonCardContent,
	IonCardHeader,
	IonCardTitle,
	IonAlert,
	IonInput,
	IonContent,
	IonHeader,
	IonImg,
	IonTitle,
	IonToolbar,
	IonButton,
	IonIcon,
	IonChip,
	ToastController,
} from '@ionic/angular/standalone';
import { FilialeService } from 'src/app/core/services/filiale.service';
import { FilialeRecord } from 'src/app/core/interfaces/Filiale';
import { RouterModule, Router } from '@angular/router';
import { ApiResponse } from 'src/app/core/interfaces/ApiResponse';

@Component({
	selector: 'app-gestisci-filiali',
	templateUrl: './gestisci-filiali.page.html',
	styleUrls: ['./gestisci-filiali.page.scss'],
	standalone: true,
	imports: [
		IonContent,
		RouterModule,
		IonHeader,
		IonTitle,
		IonToolbar,
		IonAlert,
		IonInput,
		CommonModule,
		FormsModule,
		IonCard,
		IonImg,
		IonChip,
		IonCardHeader,
		IonCardTitle,
		IonCardContent,
		IonButton,
		IonIcon,
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
		private router: Router
	) {}

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

	// Gestisce la risposta dal server al caricamento filiali
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

	// Applica filtri di ricerca alle filiali
	applyFilters() {
		const term = this.searchTerm.trim().toLowerCase();
		this.filialiFiltered = this.filiali.filter((f) =>
			f.indirizzo?.toLowerCase().includes(term)
		);
	}

	// Resetta filtri per mostrare tutte le filiali
	filterTutti() {
		this.selectedCategoria = 'Tutte';
		this.searchTerm = '';
		this.filialiFiltered = [...this.filiali];
	}

	// Mostra alert di conferma eliminazione filiale
	showAlert(filiale: FilialeRecord) {
		this.selectedFiliale = filiale;
		this.isAlertOpen = true;
	}

	// Conferma eliminazione filiale chiamando il servizio
	async onConfirm() {
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

	// Annulla l'azione di eliminazione e chiude alert
	onCancel() {
		this.isAlertOpen = false;
		this.selectedFiliale = null;
	}

	// Pulsanti da mostrare nell'alert di conferma
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

	// Naviga alla pagina di modifica passando la filiale selezionata
	modificaFiliale(filiale: FilialeRecord) {
		this.router.navigate(['/modifica-filiali'], { state: { filiale } });
	}

	// Mostra un toast con messaggio e colore specificato
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
