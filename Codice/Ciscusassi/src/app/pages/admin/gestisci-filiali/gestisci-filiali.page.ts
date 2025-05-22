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
} from '@ionic/angular/standalone';
import { FilialeService } from 'src/app/core/services/filiale.service';
import { FilialeRecord } from 'src/app/core/interfaces/Filiale';
import { RouterModule } from '@angular/router';
import { IonChip } from '@ionic/angular/standalone';
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
	filiali: FilialeRecord[] = [];
	filialiFiltered: FilialeRecord[] = [];
	loading: boolean = true;
	error: boolean = false;
	searchTerm: string = '';
	selectedCategoria: string = 'Tutte';

	constructor(private filialeService: FilialeService) {}

	private handleResponse(response: ApiResponse<FilialeRecord[]>): void {
		if (response.success && response.data) {
			this.filiali = response.data;
			this.applyFilters(); // ✅ Applichiamo subito i filtri, che al primo giro mostra tutto
		} else {
			console.error(response.message || 'Errore sconosciuto');
			this.error = true;
		}
		this.loading = false;
	}

	ngOnInit() {
		this.filialeService.GetSedi().subscribe({
			next: (response) => this.handleResponse(response),
			error: (err) => {
				console.log(err);
				this.loading = false;
				this.error = true;
			},
		});
	}

	isAlertOpen = false;
	selectedFiliale: FilialeRecord | null = null;

	// ✅ Applica la ricerca sul campo "indirizzo"
	applyFilters() {
		const term = this.searchTerm.trim().toLowerCase();

		this.filialiFiltered = this.filiali.filter(filiale => {
			const indirizzo = filiale.indirizzo?.toLowerCase() || '';
			return indirizzo.includes(term);
		});
	}

	// ✅ Mostra tutte le filiali (reset filtro)
	filterTutti() {
		this.selectedCategoria = 'Tutte';
		this.searchTerm = '';
		this.filialiFiltered = [...this.filiali];
	}

	showAlert(filiale: FilialeRecord) {
		this.selectedFiliale = filiale;
		this.isAlertOpen = true;
	}

	onConfirm() {
		if (this.selectedFiliale) {
			console.log('Confermata rimozione filiale:', this.selectedFiliale);
			// Esegui qui l'eliminazione dal backend se necessario
		}
		this.isAlertOpen = false;
		this.selectedFiliale = null;
		this.applyFilters(); // ✅ Riapplica i filtri dopo eventuale cancellazione
	}

	onCancel() {
		console.log('Rimozione annullata');
		this.isAlertOpen = false;
		this.selectedFiliale = null;
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
