import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrenotazioneService } from 'src/app/core/services/prenotazione.service';
import { FilialeService } from 'src/app/core/services/filiale.service';
import { FilialeRecord } from 'src/app/core/interfaces/Filiale';
import { ApiResponse } from 'src/app/core/interfaces/ApiResponse';
import { Router } from '@angular/router';
import {
	ToastController,
	IonGrid,
	IonRow,
	IonCol,
	IonText,
	IonInput,
} from '@ionic/angular/standalone';
import { IonContent, IonSpinner, IonButton } from '@ionic/angular/standalone';
import { NumeroPostiButton } from 'src/app/components/numero-posti-button/numero-posti-button.component';

@Component({
	selector: 'app-numero-persone', // Selettore per l'uso in HTML
	templateUrl: './numero-persone.page.html', // Template HTML associato
	styleUrls: ['./numero-persone.page.scss'], // Stili CSS
	standalone: true, // Il componente è standalone
	imports: [
		// Moduli importati per il template
		IonInput,
		IonText,
		IonCol,
		IonRow,
		IonGrid,
		IonSpinner,
		IonContent,
		CommonModule,
		FormsModule,
		IonButton,
		NumeroPostiButton,
	],
})
export class NumeroPersonePage implements OnInit {
	// Dati di stato della pagina
	filiale: FilialeRecord | null = null;
	numeroTavoliRichiesti: number = 0;
	idFiliale: number = 0;
	loading: boolean = false;
	error: boolean = false;
	personePossibili = [1, 2, 3, 4, 5, 6, 7]; // Opzioni rapide selezionabili
	personeSelezionate: number | null = null; // Valore selezionato con bottone
	inputManuale: number | null = null; // Input inserito manualmente
	readonly MAX_PERSONE = 999999; // Numero massimo per fallback

	constructor(
		private prenotazioneService: PrenotazioneService, // Gestione prenotazioni
		private filialeService: FilialeService, // Servizio filiale
		private router: Router, // Navigazione
		private toastController: ToastController // Messaggi toast
	) {}

	ngOnInit(): void {
		// Inizializzazione della pagina
		this.personeSelezionate = null;
		this.inputManuale = null;
		this.prenotazioneService.setNumeroPosti(-1); // Reset numero posti
		const id = this.prenotazioneService.getFilialeId(); // Recupero ID filiale
		this.idFiliale = id;
		this.loadFiliale(); // Carica dati filiale
	}

	private loadFiliale() {
		// Carica l'elenco delle sedi
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
		// Gestisce la risposta del server per la lista delle sedi
		this.loading = false;

		if (response.success && Array.isArray(response.data)) {
			const filiale = response.data.find(
				(f) => f.id_filiale === this.idFiliale
			);

			if (filiale) {
				this.filiale = filiale; // Trovata e assegnata
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
		// Selezione rapida del numero di persone
		this.personeSelezionate = n;
		this.inputManuale = n;
	}

	onInputChange() {
		// Aggiornamento quando si modifica l'input manuale
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
		// Validazione base del numero di persone prima di procedere
		const persone = this.inputManuale;

		if (!persone || persone < 1) {
			alert('Inserisci un numero valido di persone');
			return;
		}
	}

	salvaPersone(
		numeroPersone: number,
		numeroPersoneSelezionate: number | null
	) {
		// Logica di salvataggio e verifica disponibilità tavoli
		if (
			numeroPersone < 1 &&
			(numeroPersoneSelezionate === null || numeroPersoneSelezionate < 1)
		) {
			// Mostra toast di errore
			this.toastController
				.create({
					message: 'Il numero di persone deve essere maggiore di 0',
					duration: 2000,
					position: 'bottom',
					color: 'danger',
				})
				.then((toast) => toast.present());
			return;
		} else {
			// Usa la selezione rapida se valida
			if (
				numeroPersoneSelezionate !== null &&
				numeroPersoneSelezionate < this.MAX_PERSONE
			) {
				numeroPersone = numeroPersoneSelezionate;
			} else {
				numeroPersone = this.MAX_PERSONE;
			}

			// Calcolo numero minimo di tavoli necessari
			for (let t = 1; t <= numeroPersone; t++) {
				const postiDisponibili = 2 * t + 2;
				if (postiDisponibili >= numeroPersone) {
					this.numeroTavoliRichiesti = t;
					break;
				}
			}

			console.log(
				'Numero di tavoli richiesti:',
				this.numeroTavoliRichiesti
			);
			console.log(
				'Numero di tavoli disponibili:',
				this.filiale?.num_tavoli ?? 0
			);

			// Verifica disponibilità tavoli
			if (this.numeroTavoliRichiesti > (this.filiale?.num_tavoli ?? 0)) {
				this.toastController
					.create({
						message:
							'Non ci sono abbastanza tavoli disponibili per il numero di persone selezionato.',
						duration: 2000,
						position: 'bottom',
						color: 'danger',
					})
					.then((toast) => toast.present());
				return;
			}

			// Salva il numero e naviga alla prossima schermata
			this.prenotazioneService.setNumeroPosti(numeroPersone);
			console.log('Hai scelto il numero di persone:', numeroPersone);
			this.router.navigate(['/scelta-giorno']);
		}
	}
}
