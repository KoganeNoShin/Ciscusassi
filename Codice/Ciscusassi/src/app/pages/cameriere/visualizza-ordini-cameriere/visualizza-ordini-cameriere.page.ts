import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
	IonContent,
	IonRow,
	IonCol,
	IonButton,
	IonSpinner,
	IonText,
} from '@ionic/angular/standalone';
import { OrdProdEstended } from 'src/app/core/interfaces/OrdProd';
import { ListaOrdiniComponent } from 'src/app/components/lista-ordini/lista-ordini.component';
import { BehaviorSubject, Observable } from 'rxjs';
import { Tavolo, TavoloService } from 'src/app/core/services/tavolo.service';
import { OrdineService } from 'src/app/core/services/ordine.service';

@Component({
	selector: 'app-visualizza-ordini-cameriere',
	templateUrl: './visualizza-ordini-cameriere.page.html',
	styleUrls: ['./visualizza-ordini-cameriere.page.scss'],
	standalone: true,
	imports: [
		IonText,
		IonButton,
		IonContent,
		IonSpinner,
		CommonModule,
		FormsModule,
		ListaOrdiniComponent,
	],
})
export class VisualizzaOrdiniCamerierePage implements OnInit, OnDestroy {
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
	 * Carica gli ordini associati al tavolo corrente.
	 *
	 * Questo metodo imposta lo stato di caricamento, recupera il tavolo corrente tramite il servizio `tavoloService`
	 * e, se esiste una prenotazione associata, richiama il servizio `ordineService` per ottenere i prodotti ordinati
	 * relativi alla prenotazione. I prodotti estratti vengono inviati tramite `prodottiSubject`.
	 * Gestisce eventuali errori durante il caricamento e aggiorna gli stati di caricamento ed errore di conseguenza.
	 *
	 * @remarks
	 * - Se il tavolo o la prenotazione non sono disponibili, viene inviato un array vuoto a `prodottiSubject`.
	 * - I dettagli delle risposte e degli errori vengono loggati tramite `console`.
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
	 * Cambia lo stato di tutti i prodotti con stato 'in-consegna' a 'consegnato'.
	 * Per ogni prodotto trovato, invia una richiesta tramite `ordineService.cambiaStato`
	 * e, al completamento di ciascuna richiesta, ricarica i dati degli ordini dal backend.
	 * In caso di errore durante il cambio di stato, viene loggato un messaggio di errore.
	 */
	consegnaTutto() {
		const prodottiList = this.prodottiSubject.getValue();

		prodottiList
			.filter((p) => p.stato === 'in-consegna')
			.forEach((prodotto) => {
				this.ordineService
					.cambiaStato('consegnato', prodotto.id_ord_prod)
					.subscribe({
						next: () => {
							// Una volta aggiornato, ricarico i dati dal backend
							this.loadOrdini();
						},
						error: (err) => {
							console.error('Errore nel cambiare stato:', err);
						},
					});
			});
	}
}
