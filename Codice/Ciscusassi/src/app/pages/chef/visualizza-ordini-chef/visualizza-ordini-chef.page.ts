import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
	IonContent,
	IonHeader,
	IonTitle,
	IonToolbar,
	IonCol,
	IonButton,
	IonRow,
} from '@ionic/angular/standalone';
import { OrdProdEstended } from 'src/app/core/interfaces/OrdProd';
import { ListaOrdiniComponent } from 'src/app/components/lista-ordini/lista-ordini.component';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Tavolo, TavoloService } from 'src/app/core/services/tavolo.service';
import { OrdineService } from 'src/app/core/services/ordine.service'; // Update the path if needed

@Component({
	selector: 'app-visualizza-ordini-chef',
	templateUrl: './visualizza-ordini-chef.page.html',
	styleUrls: ['./visualizza-ordini-chef.page.scss'],
	standalone: true,
	imports: [
		IonButton,
		IonCol,
		IonContent,
		CommonModule,
		FormsModule,
		IonRow,
		IonCol,
		ListaOrdiniComponent,
	],
})
export class VisualizzaOrdiniChefPage implements OnInit, OnDestroy {


	private prodottiSubject = new BehaviorSubject<OrdProdEstended[]>([]);
	public prodotti$: Observable<OrdProdEstended[]> =
		this.prodottiSubject.asObservable();

	tavolo: Tavolo | null = null;
	private intervalAggiornamento: any;

	// Stato caricamento
	isLoading = false;

	constructor(
		private tavoloService: TavoloService,
		private ordineService: OrdineService
	) {}

	ngOnDestroy() {
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
		const nuoviProdotti = prodottiList.map((prodotto) => {
			if (prodotto.stato === 'in-consegna') {
				return { ...prodotto, stato: 'consegnato' };
			}
			return prodotto;
		});
		this.prodottiSubject.next(nuoviProdotti);
	}

	fineLavorazioneTotale() {
	throw new Error('Method not implemented.');
	}
	
	iniziaLavorazioneTotale() {
	throw new Error('Method not implemented.');
	}
}
