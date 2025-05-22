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
import { starOutline } from 'ionicons/icons';
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


	constructor(private prodottoService: ProdottoService) {
		addIcons({ starOutline });
	}

	private handleResponse(response: ApiResponse<ProdottoRecord[]>): void {
		console.log(response);

		if (response.success && response.data) {
			this.piatti = response.data;
			this.filterTutti(); 
		} else {
			console.error(response.message || 'Errore sconosciuto');
			this.error = true;
		}

		this.loading = false;
	}

	ngOnInit() {
		this.prodottoService.GetProdotti().subscribe({
			next: (response) => this.handleResponse(response),
			error: (err) => {
				console.error(err);
				this.loading = false;
				this.error = true;
			},
		});
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

	isAlertOpen = false;
	selectedProdotto: ProdottoRecord | null = null;

	showAlert(prodotto: ProdottoRecord) {
		this.selectedProdotto = prodotto;
		this.isAlertOpen = true;
	}

	onConfirm() {
		if (this.selectedProdotto) {
			console.log('Confermata rimozione filiale:', this.selectedProdotto);
			// Qui puoi chiamare il servizio per rimuovere la filiale, per esempio:
			// this.filialiServiceService.rimuoviFiliale(this.selectedFiliale.id_filiale).subscribe(...);
			// Poi aggiorna la lista, rimuovendo la filiale localmente o rifacendo la fetch
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
