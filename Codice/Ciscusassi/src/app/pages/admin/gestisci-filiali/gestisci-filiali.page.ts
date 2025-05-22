import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonAlert, IonInput, IonContent, IonHeader, IonImg, IonTitle, IonToolbar, IonButton, IonIcon } from '@ionic/angular/standalone';
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
	imports: [IonContent, RouterModule, IonHeader, IonTitle, IonToolbar, IonAlert, IonInput, CommonModule, FormsModule, IonCard, IonImg, IonChip, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon]
})

export class GestisciFilialiPage implements OnInit {

	filiali: FilialeRecord[] = [];
	loading: boolean = true;
	error: boolean = false;

	constructor(private filialeService: FilialeService) { }

	private handleResponse(response: ApiResponse<FilialeRecord[]>): void {
		console.log(response);

		if (response.success && response.data) {

			this.filiali = response.data;
			this.loading = false;
		}
		else {
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
			}
		});
	}

	isAlertOpen = false;
	selectedFiliale: FilialeRecord | null = null;

	showAlert(filiale: FilialeRecord) {
		this.selectedFiliale = filiale;
		this.isAlertOpen = true;
	}

	onConfirm() {
		if (this.selectedFiliale) {
			console.log('Confermata rimozione filiale:', this.selectedFiliale);
			// Qui puoi chiamare il servizio per rimuovere la filiale, per esempio:
			// this.filialiServiceService.rimuoviFiliale(this.selectedFiliale.id_filiale).subscribe(...);
			// Poi aggiorna la lista, rimuovendo la filiale localmente o rifacendo la fetch
		}
		this.isAlertOpen = false;
		this.selectedFiliale = null;
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
			handler: () => this.onCancel()
		},
		{
			text: 'OK',
			role: 'confirm',
			handler: () => this.onConfirm()
		}
	];

}
