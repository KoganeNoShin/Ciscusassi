import { Component, importProvidersFrom, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Servizio carrello personalizzato
import { CarrelloService } from 'src/app/core/services/carrello.service';

// Per leggere i parametri dalla route (es. codice tavolo)
import { ActivatedRoute } from '@angular/router';

// Interfaccia per descrivere i prodotti
import { ProdottoRecord } from 'src/app/core/interfaces/Prodotto';

import {
	IonContent,
	IonHeader,
	IonTitle,
	IonToolbar,
	IonGrid,
	IonRow,
	IonCol,
	IonCard,
	IonCardContent,
	IonButton,
	IonImg,
	IonSpinner,
} from '@ionic/angular/standalone';
import { TavoloService } from 'src/app/core/services/tavolo.service';
import { OrdProdEstended } from 'src/app/core/interfaces/OrdProd';

@Component({
	selector: 'app-pagamento-cassa',
	templateUrl: './pagamento-cassa.page.html',
	styleUrls: ['./pagamento-cassa.page.scss'],
	standalone: true,
	imports: [
		IonSpinner,
		IonContent,
		CommonModule,
		FormsModule,
		IonGrid,
		IonRow,
		IonCol,
		IonCard,
		IonImg,
	],
})
export class PagamentoCassaPage implements OnInit {
	// Totale dell’ordine
	totale: number = 0;

	isLoading: boolean = true;

	// Numero del tavolo (può essere usato in seguito)
	numeroTavolo: number | null = null;

	// Prodotti nel carrello (da usare o popolare in futuro)
	prodotti: OrdProdEstended[] = [];

	// Codice ricevuto dalla query string della URL
	codice: string = '';

	// Costruttore con ActivatedRoute per leggere i parametri GET dalla URL
	constructor(
		private route: ActivatedRoute,
		private tavoloService: TavoloService
	) {
		// Sottoscrizione ai parametri della route per ottenere il codice
		this.route.queryParams.subscribe((params) => {
			this.codice = params['codice'] || '';
			this.totale = params['totale'] || '';
			console.log('Codice ricevuto:', this.codice);
			console.log('Totale ricevuto', this.totale);
		});
	}

	// Hook di inizializzazione, attualmente vuoto
	ngOnInit() {
		this.ngViewWillEnter();
	}

	ngViewWillEnter() {
		this.numeroTavolo = this.tavoloService.getNumeroTavolo();
		this.totale = this.tavoloService.getTotale();
		this.prodotti = this.tavoloService.getOrdini();
		// Genera un codice univoco concatenando "P" con gli ID dei prodotti
		const numeroOrdine = this.tavoloService.getNumeroOrdine();
		this.codice = numeroOrdine !== null && numeroOrdine !== undefined ? `ordine: ${numeroOrdine}` : '';
	}
}
