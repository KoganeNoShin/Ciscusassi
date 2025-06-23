import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
	IonSpinner,
	IonContent,
	IonCardContent,
	IonInput,
	IonItem,
	IonGrid,
	IonRow,
	IonCol,
	IonList,
	IonAvatar,
	IonLabel,
	IonButton,
	IonCard,
} from '@ionic/angular/standalone';
import { HeroComponent } from 'src/app/components/hero/hero.component';
import { LeafletMapComponent } from 'src/app/components/leaflet-map/leaflet-map.component';

import { FilialeRecord } from 'src/app/core/interfaces/Filiale';
import { FilialeService } from 'src/app/core/services/filiale.service';
import { ApiResponse } from 'src/app/core/interfaces/ApiResponse';
import { Router, RouterModule } from '@angular/router';
import { PrenotazioneService } from 'src/app/core/services/prenotazione.service';

@Component({
	selector: 'app-prenota',
	templateUrl: './prenota.page.html',
	styleUrls: ['./prenota.page.scss'],
	standalone: true,
	imports: [
		RouterModule,
		IonCard,
		IonButton,
		IonLabel,
		IonCol,
		IonRow,
		IonGrid,
		IonItem,
		IonInput,
		IonSpinner,
		IonContent,
		CommonModule,
		FormsModule,
		HeroComponent,
		LeafletMapComponent,
		IonButton,
	],
})
export class PrenotaPage implements OnInit {
	filiali: FilialeRecord[] = [];
	loading: boolean = true;
	error: boolean = false;

	searchFiliale: string = '';
	filialiFiltrate: any[] = [];

	constructor(
		private filialeService: FilialeService,
		private router: Router,
		private prenotazioneService: PrenotazioneService
	) {}

	private handleResponse(response: ApiResponse<FilialeRecord[]>): void {
		console.log(response);

		if (response.success && response.data) {
			this.filiali = response.data;
			this.loading = false;
			this.filialiFiltrate = this.filiali;
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
		this.prenotazioneService.svuotaPrenotazione();
	}

	filtroFiliali() {
		const term = this.searchFiliale.toLowerCase();

		this.filialiFiltrate = this.filiali.filter((filiale) =>
			filiale.indirizzo.toLowerCase().includes(term)
		);
	}

	salvaFiliale(id_filiale: number) {
		this.prenotazioneService.setFilialeId(id_filiale);
		console.log('Hai scelto la filiale', id_filiale);
		this.router.navigate(['/numero-persone']);
	}
}
