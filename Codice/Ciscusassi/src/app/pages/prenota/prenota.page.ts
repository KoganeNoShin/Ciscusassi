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
} from '@ionic/angular/standalone';
import { HeroComponent } from 'src/app/components/hero/hero.component';
import { LeafletMapComponent } from 'src/app/components/leaflet-map/leaflet-map.component';

import { FilialeRecord } from 'src/app/core/interfaces/Filiale';
import { FilialeService } from 'src/app/core/services/filiale.service';
import { ApiResponse } from 'src/app/core/interfaces/ApiResponse';

@Component({
	selector: 'app-prenota',
	templateUrl: './prenota.page.html',
	styleUrls: ['./prenota.page.scss'],
	standalone: true,
	imports: [
		IonAvatar,
		IonList,
		IonLabel,
		IonAvatar,
		IonList,
		IonCol,
		IonRow,
		IonGrid,
		IonItem,
		IonInput,
		IonSpinner,
		IonCardContent,
		IonContent,
		CommonModule,
		FormsModule,
		HeroComponent,
		LeafletMapComponent,
	],
})
export class PrenotaPage implements OnInit {
	filiali: FilialeRecord[] = [];
	loading: boolean = true;
	error: boolean = false;

	searchFiliale: string = '';
	filialiFiltrate: any[] = [];

	constructor(private filialeService: FilialeService) {}

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
	}

	filtroFiliali() {
		const term = this.searchFiliale.toLowerCase();

		this.filialiFiltrate = this.filiali.filter((filiale) =>
			filiale.indirizzo.toLowerCase().includes(term)
		);
	}
}
