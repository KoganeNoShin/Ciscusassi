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
