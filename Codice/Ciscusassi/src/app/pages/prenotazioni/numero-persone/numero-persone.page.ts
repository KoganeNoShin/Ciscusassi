import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PrenotazioneService } from 'src/app/core/services/prenotazione.service';
import { FilialeService } from 'src/app/core/services/filiale.service';
import { FilialeRecord } from 'src/app/core/interfaces/Filiale';
import { ApiResponse } from 'src/app/core/interfaces/ApiResponse';
import { Router } from '@angular/router';
import {
	IonContent,
	IonSpinner,
	IonButton,
} from '@ionic/angular/standalone';
import { HeroComponent } from '../../../components/hero/hero.component';

@Component({
	selector: 'app-numero-persone',
	templateUrl: './numero-persone.page.html',
	styleUrls: ['./numero-persone.page.scss'],
	standalone: true,
	imports: [IonSpinner, IonContent, CommonModule, FormsModule, IonButton],
})
export class NumeroPersonePage implements OnInit {
	filiale: FilialeRecord | null = null;
	idFiliale: number = 0;
	loading: boolean = false;
	error: boolean = false;
	personePossibili = [1, 2, 3, 4, 5, 6, 7];
	personeSelezionate: number | null = null;
	inputManuale: number | null = null;

	constructor(
		private route: ActivatedRoute,
		private prenotazioneService: PrenotazioneService,
		private filialeService: FilialeService,
    private router:Router
	) {
		console.log('Costruttore chiamato');
		// Inizializzo idFiliale qui, anche se sarà aggiornato dopo su cambio params
		this.idFiliale = this.prenotazioneService.getFilialeId();
		console.log('idFiliale ottenuto nel costruttore:', this.idFiliale);
	}

	ngOnInit(): void {
		console.log('ngOnInit chiamato');

		this.personeSelezionate = null;
		this.inputManuale = null;
    this.prenotazioneService.setNumeroPosti(0);

		// Sottoscrivo ai parametri di rotta per gestire anche navigazioni che non ricreano il componente
		this.route.params.subscribe((params) => {
			console.log('Parametri di rotta cambiati:', params);
			this.idFiliale = this.prenotazioneService.getFilialeId();
			this.loadFiliale();
		});
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
				console.log('Filiale trovata:', filiale);
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

  salvaPersone(numeroPersone: number){
    this.prenotazioneService.setNumeroPosti(numeroPersone);
    console.log('Hai scelto il numero di persone:', numeroPersone);
    this.router.navigate(['/scelta-giorno']);
  }
}
