import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
	IonChip,
	IonInput,
	IonCard,
	IonCardContent,
	IonCardHeader,
	IonCardTitle,
	IonAlert,
	IonContent,
	IonHeader,
	IonImg,
	IonTitle,
	IonToolbar,
	IonButton,
	IonIcon,
} from '@ionic/angular/standalone';
import { ProdottoService } from 'src/app/core/services/prodotto.service';
import { starOutline, star } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { RouterModule } from '@angular/router';

import { ApiResponse } from 'src/app/core/interfaces/ApiResponse';
import { ProdottoRecord } from 'src/app/core/interfaces/Prodotto';

@Component({
	selector: 'app-gestisci-piatti',
	templateUrl: './gestisci-piatti.page.html',
	styleUrls: ['./gestisci-piatti.page.scss'],
	standalone: true,
	imports: [
		IonContent,
		RouterModule,
		IonInput,
		IonHeader,
		IonTitle,
		IonAlert,
		IonToolbar,
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
export class GestisciPiattiPage implements OnInit {
	piatti: ProdottoRecord[] = [];
	filteredPiatti: ProdottoRecord[] = [];
	loading: boolean = true;
	error: boolean = false;
	selectedCategoria: string = 'Tutti';
	searchTerm: string = '';

	piattoDelGiorno: ProdottoRecord | null = null;

	constructor(private prodottoService: ProdottoService) {
		addIcons({ starOutline, star });
	}

	ngOnInit() {
		this.caricaPiattoDelGiorno();

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
			this.filterTutti(); 
		} else {
			console.error(response.message || 'Errore sconosciuto');
			this.error = true;
		}
		this.loading = false;
	}

	caricaPiattoDelGiorno(): void {
		this.prodottoService.GetPiattoDelGiorno().subscribe({
			next: (response) => {
				if (response.success && response.data) {
					this.piattoDelGiorno = response.data;
				}
			},
			error: (err) => console.error('Errore nel caricamento del piatto del giorno', err),
		});
	}

	selezionaPiattoDelGiorno(piatto: ProdottoRecord): void {
		const isAlreadySelected = this.piattoDelGiorno?.id_prodotto === piatto.id_prodotto;

		if (isAlreadySelected) {
			this.piattoDelGiorno = null;
			this.prodottoService.chargePiattoDelGiorno(0).subscribe({
				next: () => console.log('Piatto del giorno rimosso'),
				error: (err) => console.error('Errore nella rimozione del piatto del giorno', err),
			});
		} else {
			this.piattoDelGiorno = piatto;
			this.prodottoService.chargePiattoDelGiorno(piatto.id_prodotto).subscribe({
				next: () => console.log('Piatto del giorno impostato:', piatto.nome),
				error: (err) => console.error('Errore nell’impostazione del piatto del giorno', err),
			});
		}
	}

	filterAntipasti() {
		this.selectedCategoria = 'Antipasti';
		this.filteredPiatti = this.piatti.filter(p => p.categoria === 'ANTIPASTO');
	}

	filterPrimi() {
		this.selectedCategoria = 'Primi';
		this.filteredPiatti = this.piatti.filter(p => p.categoria === 'PRIMO');
	}

	filterBevande() {
		this.selectedCategoria = 'Bevande';
		this.filteredPiatti = this.piatti.filter(p => p.categoria === 'BEVANDA');
	}

	filterDolci() {
		this.selectedCategoria = 'Dolci';
		this.filteredPiatti = this.piatti.filter(p => p.categoria === 'DOLCE');
	}

	filterTutti() {
		this.selectedCategoria = 'Tutti';
		this.filteredPiatti = this.piatti;
	}

	applyFilters() {
		const categoria = this.selectedCategoria;
		const term = this.searchTerm.toLowerCase();

		this.filteredPiatti = this.piatti.filter(p => {
			const matchCategoria = categoria === 'Tutti' || p.categoria === categoria;
			const matchSearch = p.nome.toLowerCase().includes(term) || p.descrizione.toLowerCase().includes(term);
			return matchCategoria && matchSearch;
		});
	}

	isAlertOpen = false;
	selectedProdotto: ProdottoRecord | null = null;

	showAlert(prodotto: ProdottoRecord) {
		this.selectedProdotto = prodotto;
		this.isAlertOpen = true;
	}

	onConfirm() {
		if (this.selectedProdotto) {
			console.log('Confermata rimozione del prodotto:', this.selectedProdotto);
			// this.prodottoService.deleteProdotto(this.selectedProdotto.id_prodotto).subscribe(...);
		}
		this.isAlertOpen = false;
		this.selectedProdotto = null;
	}

	onCancel() {
		console.log('Rimozione annullata');
		this.isAlertOpen = false;
		this.selectedProdotto = null;
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
}
