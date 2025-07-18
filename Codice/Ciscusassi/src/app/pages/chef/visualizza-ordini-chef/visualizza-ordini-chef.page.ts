import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
	IonContent,
	IonButton,
	IonRow,
	IonText,
	IonSpinner,
} from '@ionic/angular/standalone';
import { OrdProdEstended } from 'src/app/core/interfaces/OrdProd';
import { ListaOrdiniComponent } from 'src/app/components/lista-ordini/lista-ordini.component';
import { BehaviorSubject, Observable } from 'rxjs';
import { Tavolo, TavoloService } from 'src/app/core/services/tavolo.service';
import { OrdineService } from 'src/app/core/services/ordine.service';

@Component({
	selector: 'app-visualizza-ordini-chef',
	templateUrl: './visualizza-ordini-chef.page.html',
	styleUrls: ['./visualizza-ordini-chef.page.scss'],
	standalone: true,
	imports: [
		IonButton,
		IonContent,
		CommonModule,
		FormsModule,
		ListaOrdiniComponent,
		IonText,
		IonSpinner,
	],
})
export class VisualizzaOrdiniChefPage implements OnInit, OnDestroy {
	private prodottiSubject = new BehaviorSubject<OrdProdEstended[]>([]);
	public prodotti$: Observable<OrdProdEstended[]> =
		this.prodottiSubject.asObservable();

	tavolo: Tavolo | null = null;
	private intervalAggiornamento: any;

	isLoading = false;
	error = false;

	constructor(
		private tavoloService: TavoloService,
		private ordineService: OrdineService
	) {}

	ngOnDestroy() {
		this.ionViewWillLeave(); // Chiama il metodo per pulire l'intervallo di aggiornamento
	}

	ionViewWillLeave() {
		// Cancella l'intervallo di aggiornamento quando il componente sta per essere abbandonato
		if (this.intervalAggiornamento) {
			clearInterval(this.intervalAggiornamento);
		}
	}

	ngOnInit(): void {
		this.ngViewWillEnter();
	}

	ngViewWillEnter() {
		this.loadOrdini();
		this.intervalAggiornamento = setInterval(
			() => this.loadOrdini(),
			30000
		);
	}

	/**
	 * Carica gli ordini relativi al tavolo corrente.
	 * Recupera il tavolo dal servizio dedicato, verifica la presenza della prenotazione,
	 * quindi chiama il servizio ordini per ottenere i prodotti ordinati associati a quella prenotazione.
	 * Aggiorna lo stato di caricamento e gestisce eventuali errori.
	 */
	loadOrdini() {
		this.isLoading = true;

		this.tavolo = this.tavoloService.getTavolo();
		console.log('Tavolo:', this.tavolo);
		console.log('Prenotazione:', this.tavolo?.prenotazione);

		if (this.tavolo && this.tavolo.prenotazione) {
			this.ordineService
				.getProdottiOrdinatiByPrenotazione(this.tavolo.prenotazione)
				.subscribe({
					next: (response) => {
						console.log(
							'Risposta completa dal servizio:',
							response
						);

						let prodotti: OrdProdEstended[] = [];

						if (Array.isArray(response)) {
							prodotti = response;
						} else if (response && Array.isArray(response.data)) {
							prodotti = response.data;
						} else {
							console.warn(
								'Struttura della risposta non riconosciuta:',
								response
							);
						}

						console.log('Prodotti estratti:', prodotti);
						this.prodottiSubject.next(prodotti);
					},
					error: (err) => {
						console.error('Errore nel caricamento ordini:', err);
						this.prodottiSubject.next([]);
						this.isLoading = false;
						this.error = true;
					},
					complete: () => {
						this.isLoading = false;
					},
				});
		} else {
			this.prodottiSubject.next([]);
			this.isLoading = false;
		}
	}

	/**
	 * Segna come completata la lavorazione di tutti i prodotti attualmente in stato 'in-lavorazione'.
	 * Per ciascun prodotto in lavorazione, invia una richiesta al backend per aggiornare lo stato a 'in-consegna'.
	 * Al completamento dell'aggiornamento di ciascun prodotto, ricarica la lista degli ordini per mantenere i dati aggiornati.
	 * Gestisce eventuali errori di aggiornamento loggandoli sulla console.
	 */
	fineLavorazioneTotale() {
		const prodottiList = this.prodottiSubject.getValue();

		prodottiList
			.filter((p) => p.stato === 'in-lavorazione')
			.forEach((prodotto) => {
				this.ordineService
					.cambiaStato('in-consegna', prodotto.id_ord_prod)
					.subscribe({
						next: () => {
							// Stato aggiornato sul backend, ricarico i dati per evitare inconsistenze
							this.loadOrdini();
						},
						error: (err) => {
							console.error('Errore nel cambiare stato:', err);
						},
					});
			});
	}

	/**
	 * Avvia la lavorazione di tutti i prodotti attualmente in stato 'non-in-lavorazione'.
	 * Per ciascun prodotto in questo stato, invia una richiesta al backend per aggiornare lo stato a 'in-lavorazione'.
	 * Dopo ogni aggiornamento di stato, ricarica la lista degli ordini per mantenere i dati sincronizzati.
	 * In caso di errore durante l'aggiornamento, l'errore viene stampato in console.
	 */
	iniziaLavorazioneTotale() {
		const prodottiList = this.prodottiSubject.getValue();

		prodottiList
			.filter((p) => p.stato === 'non-in-lavorazione')
			.forEach((prodotto) => {
				this.ordineService
					.cambiaStato('in-lavorazione', prodotto.id_ord_prod)
					.subscribe({
						next: () => {
							// Stato aggiornato sul backend, ricarico i dati
							this.loadOrdini();
						},
						error: (err) => {
							console.error('Errore nel cambiare stato:', err);
						},
					});
			});
	}
}
