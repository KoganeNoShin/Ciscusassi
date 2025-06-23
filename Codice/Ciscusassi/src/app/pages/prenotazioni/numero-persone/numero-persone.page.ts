import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrenotazioneService } from 'src/app/core/services/prenotazione.service';
import { FilialeService } from 'src/app/core/services/filiale.service';
import { FilialeRecord } from 'src/app/core/interfaces/Filiale';
import { ApiResponse } from 'src/app/core/interfaces/ApiResponse';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular/standalone';
import {
	IonContent,
	IonSpinner,
	IonButton,
} from '@ionic/angular/standalone';

@Component({
	selector: 'app-numero-persone',
	templateUrl: './numero-persone.page.html',
	styleUrls: ['./numero-persone.page.scss'],
	standalone: true,
	imports: [IonSpinner, IonContent, CommonModule, FormsModule, IonButton],
})
export class NumeroPersonePage implements OnInit {
	filiale: FilialeRecord | null = null;
	numeroTavoliRichiesti: number = 0;
	idFiliale: number = 0;
	loading: boolean = false;
	error: boolean = false;
	personePossibili = [1, 2, 3, 4, 5, 6, 7];
	personeSelezionate: number | null = null;
	inputManuale: number | null = null;

	constructor(
		private prenotazioneService: PrenotazioneService,
		private filialeService: FilialeService,
    	private router:Router,
		private toastController: ToastController
	) {	}

	ngOnInit(): void {
		this.personeSelezionate = null;
		this.inputManuale = null;
		this.prenotazioneService.setNumeroPosti(-1);
		const id = this.prenotazioneService.getFilialeId();
		this.idFiliale = id;
		this.loadFiliale();
	}

	private loadFiliale() {
		this.loading = true;
		this.error = false;
		this.filialeService.GetSedi().subscribe({
			next: (response) => this.handleResponse(response),
			error: (err) => {
				console.error('Errore chiamata GetSedi:', err);
				this.loading = false;
				this.error = true;
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
				this.error = false;
			} else {
				console.error('Filiale non trovata con id:', this.idFiliale);
				this.error = true;
			}
		} else {
			console.error(
				'Errore nella risposta:',
				response.message || 'Errore sconosciuto'
			);
			this.error = true;
		}

		console.log('Filiale caricata:', this.filiale);
	}

	selezionaPersone(n: number) {
		this.personeSelezionate = n;
		this.inputManuale = n;
	}

	onInputChange() {
		if (
			this.inputManuale !== null &&
			this.personePossibili.includes(this.inputManuale)
		) {
			this.personeSelezionate = null;
		} else {
			this.personeSelezionate = null;
		}
	}

	conferma() {
		const persone = this.inputManuale;

		if (!persone || persone < 1) {
			alert('Inserisci un numero valido di persone');
			return;
		}
	}

  salvaPersone(numeroPersone: number, numeroPersoneSelezionate: number | null) {
	if (numeroPersone < 1 && (numeroPersoneSelezionate === null || numeroPersoneSelezionate < 1)) {
	  this.toastController.create({
		message: 'Il numero di persone deve essere maggiore di 0',
		duration: 2000,
		position: 'bottom',
		color: 'danger',
	  }).then(toast => toast.present());
	  return;
	} else {
		if (numeroPersoneSelezionate !== null) {
			numeroPersone = numeroPersoneSelezionate;
		}

		for (let t = 2; t <= numeroPersone; t++) {
			const postiDisponibili = 2 * t + 2;
			if (postiDisponibili >= numeroPersone) {
				this.numeroTavoliRichiesti = t;
				break;
			}
		}
		
		console.log('Numero di tavoli richiesti:', this.numeroTavoliRichiesti);
		console.log('Numero di tavoli disponibili:', this.filiale?.num_tavoli ?? 0);
		if (this.numeroTavoliRichiesti > (this.filiale?.num_tavoli ?? 0)) {
			this.toastController.create({
				message: 'Non ci sono abbastanza tavoli disponibili per il numero di persone selezionato.',
				duration: 2000,
				position: 'bottom',
				color: 'danger',
			}).then(toast => toast.present());
			return;
		}
		this.prenotazioneService.setNumeroPosti(numeroPersone);
		console.log('Hai scelto il numero di persone:', numeroPersone);
		this.router.navigate(['/scelta-giorno']);
	}
  }
}
