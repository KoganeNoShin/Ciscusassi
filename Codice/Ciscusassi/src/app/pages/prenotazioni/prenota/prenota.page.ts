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
	IonLabel,
	IonButton,
	IonCard,
	IonIcon,
} from '@ionic/angular/standalone';
import { HeroComponent } from 'src/app/components/hero/hero.component';
import { LeafletMapComponent } from 'src/app/components/leaflet-map/leaflet-map.component';

import { FilialeRecord } from 'src/app/core/interfaces/Filiale';
import { FilialeService } from 'src/app/core/services/filiale.service';
import { ApiResponse } from 'src/app/core/interfaces/ApiResponse';
import { Router, RouterModule } from '@angular/router';
import { PrenotazioneService } from 'src/app/core/services/prenotazione.service';
import { PrenotazioneRecord } from 'src/app/core/interfaces/Prenotazione';

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
		IonIcon,
		CommonModule,
		FormsModule,
		HeroComponent,
		LeafletMapComponent,
	],
})
export class PrenotaPage implements OnInit {
	filiali: FilialeRecord[] = [];
	filialiFiltrate: FilialeRecord[] = [];
	loading: boolean = true;
	error: boolean = false;

	searchFiliale: string = '';

	prenotazioni: PrenotazioneRecord[] = [];
	FilialePrenotazione: FilialeRecord | null = null;
	constructor(
		private filialeService: FilialeService,
		private router: Router,
		private prenotazioneService: PrenotazioneService
	) {}

	ngOnInit(): void {
		this.caricaFiliali();
		this.caricaPrenotazioniCliente();
		this.prenotazioneService.svuotaPrenotazione();
	}

	private caricaFiliali(): void {
		this.filialeService.GetSedi().subscribe({
			next: (res: ApiResponse<FilialeRecord[]>) => {
				if (res.success && res.data) {
					this.filiali = res.data;
					this.filialiFiltrate = res.data;
				} else {
					this.error = true;
				}
				this.loading = false;
			},
			error: () => {
				this.error = true;
				this.loading = false;
			},
		});
	}

	private caricaPrenotazioniCliente(): void {
		const idCliente = 18; // ID cliente fisso per ora
		this.prenotazioneService.getPrenotazioniByCliente(idCliente).subscribe({
			next: (res) => {
				if (res.success && res.data) {
					this.prenotazioni = res.data;
					console.log('Prenotazioni del cliente:', this.prenotazioni);
				} else {
					this.prenotazioni = [];
				}
			},
			error: (err) => {
				console.error('Errore nel recupero prenotazioni:', err);
				this.prenotazioni = [];
			},
		});
	}

	filtroFiliali(): void {
		const term = this.searchFiliale.toLowerCase();
		this.filialiFiltrate = this.filiali.filter((filiale) =>
			filiale.indirizzo.toLowerCase().includes(term)
		);
	}

	salvaFiliale(id_filiale: number): void {
		this.prenotazioneService.setFilialeId(id_filiale);
		console.log('Hai scelto la filiale', id_filiale);
		this.router.navigate(['/numero-persone']);
	}

	cancellaPrenotazione(id: number): void {
		this.prenotazioneService.eliminaPrenotazione(id).subscribe({
			next: (res) => {
				if (res.success) {
					this.prenotazioni = this.prenotazioni.filter(
						(p) => p.id_prenotazione !== id
					);
				}
			},
			error: (err) => {
				console.error('Errore nella cancellazione:', err);
			},
		});
	}
}
