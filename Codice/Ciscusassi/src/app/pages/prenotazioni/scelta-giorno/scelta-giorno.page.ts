import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilialeRecord } from 'src/app/core/interfaces/Filiale';
import { PrenotazioneService } from 'src/app/core/services/prenotazione.service';
import { FilialeService } from 'src/app/core/services/filiale.service';
import { Router } from '@angular/router';
// import { IonContent, IonSpinner } from '@ionic/angular/standalone';
import { ApiResponse } from 'src/app/core/interfaces/ApiResponse';
import { take } from 'rxjs/operators';
import {
	IonContent,
	IonSpinner,
	IonDatetime,
	IonLabel,
	IonRow,
	IonCol,
	IonButton,
} from '@ionic/angular/standalone';

@Component({
	selector: 'app-scelta-giorno',
	templateUrl: './scelta-giorno.page.html',
	styleUrls: ['./scelta-giorno.page.scss'],
	standalone: true,
	imports: [
		IonButton,
		IonCol,
		IonRow,
		IonDatetime,
		IonSpinner,
		IonContent,
		CommonModule,
		FormsModule,
	],
})
export class SceltaGiornoPage implements OnInit {
	filiale: FilialeRecord | null = null;
	idFiliale: number = 0;
	loading: boolean = false;
	hasError: boolean = false;
	persone: number | null = null;
  noMartediEMaxDueSettimane = (dateString: string): boolean => {
  const d = new Date(dateString);
  const oggi = new Date();
  const giorno = d.getUTCDay(); // 0 = domenica, 1 = lunedì, 2 = martedì...

  // Rimuovo ora/min/sec per oggi
  oggi.setHours(0, 0, 0, 0);

  // Calcola data di fine intervallo (oggi + 14 giorni)
  const dueSettimane = new Date(oggi);
  dueSettimane.setDate(oggi.getDate() + 14);

  // Rimuovo ora/min/sec dalla data d
  d.setHours(0, 0, 0, 0);

  return giorno !== 2 && d.getTime() >= oggi.getTime() && d.getTime() <= dueSettimane.getTime();
};

	constructor(
		private prenotazioneService: PrenotazioneService,
		private filialeService: FilialeService
	) {}

	private loadFiliale() {
		this.loading = true;
		this.hasError = false;
		this.filialeService
			.GetSedi()
			.pipe(
				// Automatically unsubscribe after the first emission
				take(1)
			)
			.subscribe({
				next: (response) => this.handleResponse(response),
				error: (err) => {
					console.error('Errore chiamata GetSedi:', err);
					this.loading = false;
					this.hasError = true;
				},
			});
	}

	private handleResponse(response: ApiResponse<FilialeRecord[]>): void {
		this.loading = false;

		if (response.success && Array.isArray(response.data)) {
			const filiale = response.data.find(
				(f) => f.id_filiale === this.idFiliale
			);

			if (filiale) {
				this.filiale = filiale;
				this.hasError = false;
			} else {
				console.error('Filiale non trovata con id:', this.idFiliale);
				this.hasError = true;
			}
		} else {
			console.error(
				'Errore nella risposta:',
				response.message || 'Errore sconosciuto'
			);
			this.hasError = true;
		}

		// console.log('Filiale caricata:', this.filiale);
	}
	ngOnInit() {
		const id = this.prenotazioneService.getFilialeId();
		this.idFiliale = id;
		this.loadFiliale();

		const num = this.prenotazioneService.getNumeroPosti();
		this.persone = num;
		// console.log('Numero persone caricato:', this.persone);
	}


}
