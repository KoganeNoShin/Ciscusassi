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

	// Conferma eliminazione filiale chiamando il servizio
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

	// Annulla l'azione di eliminazione e chiude alert
	cancellaEliminaFiliale() {
		this.isAlertOpen = false;
		this.selectedFiliale = null;
	}

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
