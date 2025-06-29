import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
	IonContent,
	IonRow,
	IonCol,
	IonButton,
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
		IonButton,
		IonCol,
		IonRow,
		IonContent,
		CommonModule,
		FormsModule,
		ListaOrdiniComponent,
	],
})
export class VisualizzaOrdiniCamerierePage implements OnInit {
	private prodottiSubject = new BehaviorSubject<OrdProdEstended[]>([]);
	public prodotti$: Observable<OrdProdEstended[]> =
		this.prodottiSubject.asObservable();

	tavolo: Tavolo | null = null;
	private intervalAggiornamento: any;

	constructor(
		private tavoloService: TavoloService,
		private ordineService: OrdineService
	) {}

	// Metodo lifecycle Angular chiamato prima che il componente venga distrutto
	ngOnDestroy() {
		// Se esiste un intervallo di aggiornamento, lo cancella per evitare memory leak
		if (this.intervalAggiornamento) {
			clearInterval(this.intervalAggiornamento);
		}
	}

	ngOnInit(): void {
		this.ngViewWillEnter();
	}

	ngViewWillEnter() {
		this.loadOrdini(); // Carica gli ordini inizialmente

		// Imposta un intervallo che ricarica gli ordini ogni 30 secondi
		this.intervalAggiornamento = setInterval(
			() => this.loadOrdini(),
			30000
		);
	}

	loadOrdini(){
		this.tavolo = this.tavoloService.getTavolo();
		console.log('Tavolo:', this.tavolo);
		console.log('Prenotazione:', this.tavolo?.prenotazione);

		if (this.tavolo && this.tavolo.prenotazione) {
			this.ordineService
				.getProdottiOrdinatiByPrenotazione(this.tavolo.prenotazione)
				.subscribe((response) => {
					console.log('Risposta completa dal servizio:', response);

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
				});
		} else {
			this.prodottiSubject.next([]);
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
}
