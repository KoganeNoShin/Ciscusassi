import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
	IonChip,
	IonAlert,
	IonContent,
	IonButton,
	IonIcon,
	ToastController,
	IonText,
	IonSearchbar,
	IonSpinner,
} from '@ionic/angular/standalone';
import { ProdottoService } from 'src/app/core/services/prodotto.service';
import { starOutline, star, add } from 'ionicons/icons';
import { addIcons } from 'ionicons';

import { ApiResponse } from 'src/app/core/interfaces/ApiResponse';
import { ProdottoRecord } from 'src/app/core/interfaces/Prodotto';
import { PiattoAmministratoreComponent } from 'src/app/components/piatto-amministratore/piatto-amministratore.component';
import { RouterModule } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
	selector: 'app-gestisci-piatti',
	templateUrl: './gestisci-piatti.page.html',
	styleUrls: ['./gestisci-piatti.page.scss'],
	standalone: true,
	imports: [
		IonSpinner,
		IonSearchbar,
		IonText,
		IonContent,
		CommonModule,
		FormsModule,
		IonChip,
		IonButton,
		IonIcon,
		PiattoAmministratoreComponent,
		RouterModule,
	],
})
export class GestisciPiattiPage implements OnInit {
	piatti: ProdottoRecord[] = []; // Lista completa dei piatti
	filteredPiatti: ProdottoRecord[] = []; // Piatti filtrati in base a categoria e ricerca
	loading: boolean = true; // Stato caricamento
	error: boolean = false; // Stato errore caricamento
	selectedCategoria: string = 'Tutti'; // Categoria filtro selezionata
	searchTerm: string = ''; // Testo di ricerca

	piattoDelGiorno: ProdottoRecord | null = null; // Piatto del giorno

	isAlertOpen = false; // Stato alert di conferma eliminazione
	selectedProdotto: ProdottoRecord | null = null; // Prodotto selezionato per azioni

	constructor(
		private prodottoService: ProdottoService,
		private toastController: ToastController,
		private alertController: AlertController
	) {
		// Registrazione icone usate nel componente
		addIcons({ starOutline, star, add });
	}

	ngOnInit() {
		this.caricaPiattoDelGiorno();
		this.caricaPiatti();
	}

	caricaPiatti() {
		// Carica tutti i piatti
		this.prodottoService.GetProdotti().subscribe({
			next: (response) => this.handleResponse(response),
			error: (err) => {
				console.error(err);
				this.loading = false;
				this.error = true;
			},
		});
	}

	private handleResponse(response: ApiResponse<ProdottoRecord[]>): void {
		if (response.success && response.data) {
			this.piatti = response.data;
			this.filterByCategory('Tutti');
		} else {
			console.error(response.message || 'Errore sconosciuto');
			this.error = true;
		}
		this.loading = false;
	}

	// Carica il piatto del giorno dal backend
	caricaPiattoDelGiorno(): void {
		this.prodottoService.GetPiattoDelGiorno().subscribe({
			next: (response) => {
				if (response.success && response.data) {
					this.piattoDelGiorno = response.data;
				}
			},
			error: (err) =>
				console.error(
					'Errore nel caricamento del piatto del giorno',
					err
				),
		});
	}

	// Seleziona o deseleziona il piatto del giorno
	changePiattoDelGiorno(piatto: ProdottoRecord): void {
		const isAlreadySelected =
			this.piattoDelGiorno?.id_prodotto === piatto.id_prodotto;

		// Se stiamo provando a rimuovere il piatto del giorno senza sostituirlo
		// Diamo un errore e non facciamo nient'altro
		if (isAlreadySelected) {
			this.showToast(
				'Non puoi rimuovere un piatto del giorno senza sostituirlo con un altro!',
				'danger'
			);
			return;
		}

		// Imposta il piatto selezionato come piatto del giorno
		this.piattoDelGiorno = piatto;
		this.prodottoService
			.changePiattoDelGiorno(piatto.id_prodotto)
			.subscribe({
				next: () =>
					this.showToast('Piatto del giorno impostato', 'success'),
				error: (err) => {
					console.error(
						'Errore nell’impostazione del piatto del giorno',
						err
					);
					this.showToast(
						'Errore nell’impostazione del piatto',
						'danger'
					);
				},
			});
	}

	// Funzione che applica il filtro in base alla categoria
	filterByCategory(categoria: string) {
		// Imposta la categoria selezionata
		this.selectedCategoria = categoria;

		// Se la categoria è "Tutti", mostriamo tutti i piatti
		if (categoria === 'Tutti') {
			this.filteredPiatti = this.piatti;
		}
		// Se la categoria è "PiattoDelGiorno", mostriamo solo il piatto del giorno
		else if (categoria === 'PiattoDelGiorno' && this.piattoDelGiorno) {
			this.filteredPiatti = this.piatti.filter(
				(p) => p.id_prodotto === this.piattoDelGiorno!.id_prodotto
			);
		}
		// Se la categoria è una categoria specifica, filtriamo per quella categoria
		else {
			this.filteredPiatti = this.piatti.filter(
				(p) => p.categoria === categoria.toUpperCase()
			);
		}
	}

	applyFilters() {
		// Usa il metodo filterByCategory per filtrare per categoria
		this.filterByCategory(this.selectedCategoria);

		// Poi applica il filtro di ricerca
		const term = this.searchTerm.toLowerCase();
		this.filteredPiatti = this.filteredPiatti.filter((p) => {
			const matchSearch =
				p.nome.toLowerCase().includes(term) ||
				p.descrizione.toLowerCase().includes(term);
			return matchSearch;
		});
	}

	// Mostra alert di conferma per eliminare un prodotto
	async showAlertDeletePiatto(prodotto: ProdottoRecord) {
		this.selectedProdotto = prodotto;
		this.isAlertOpen = true;

		const alert = await this.alertController.create({
			header: 'Conferma cancellazione',
			message: `Sei sicuro di voler cancellare il piatto ${this.selectedProdotto.nome}?`,
			buttons: [
				{
					text: 'Annulla',
					role: 'cancel',
					handler: async () => {
						this.cancellaEliminaProdotto();
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
						this.confermaEliminaProdotto();
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

	// Pulsante conferma eliminazione nell'alert
	confermaEliminaProdotto() {
		if (this.selectedProdotto) {
			const id = this.selectedProdotto.id_prodotto;

			this.prodottoService.deleteProdotto(id).subscribe({
				next: (response) => {
					if (response.success) {
						this.piatti = this.piatti.filter(
							(p) => p.id_prodotto !== id
						);
						this.applyFilters();
						this.showToast(
							'Prodotto eliminato con successo',
							'success'
						);
					} else {
						console.error(
							'Errore nella risposta del server:',
							response.message
						);
						this.showToast(
							'Errore durante l’eliminazione',
							'danger'
						);
					}
				},
				error: (err) => {
					console.error(
						'Errore durante l’eliminazione del prodotto:',
						err
					);
					this.showToast('Errore durante l’eliminazione', 'danger');
				},
				complete: () => {
					this.isAlertOpen = false;
					this.selectedProdotto = null;
				},
			});
		} else {
			this.isAlertOpen = false;
			this.selectedProdotto = null;
		}
	}

	// Pulsante cancella eliminazione nell'alert
	cancellaEliminaProdotto() {
		console.log('Rimozione annullata');
		this.isAlertOpen = false;
		this.selectedProdotto = null;
	}

	// Mostra toast con messaggio e colore
	private async showToast(message: string, color: 'success' | 'danger') {
		const toast = await this.toastController.create({
			message,
			duration: 1000,
			color,
			position: 'middle',
		});
		toast.present();
	}
}
