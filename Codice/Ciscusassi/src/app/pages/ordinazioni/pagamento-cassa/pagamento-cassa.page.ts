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
} from '@ionic/angular/standalone';

@Component({
	selector: 'app-pagamento-cassa',
	templateUrl: './pagamento-cassa.page.html',
	styleUrls: ['./pagamento-cassa.page.scss'],
	standalone: true,
	imports: [
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

	// Numero del tavolo (può essere usato in seguito)
	numeroTavolo: number = 0;

	// Prodotti nel carrello (da usare o popolare in futuro)
	prodottiNelCarrello: ProdottoRecord[] = [];

	// Codice ricevuto dalla query string della URL
	codice: string = '';

	// Costruttore con ActivatedRoute per leggere i parametri GET dalla URL
	constructor(private route: ActivatedRoute) {
		// Sottoscrizione ai parametri della route per ottenere il codice
		this.route.queryParams.subscribe((params) => {
			this.codice = params['codice'] || '';
			console.log('Codice ricevuto:', this.codice);
		});
	}

	// Hook di inizializzazione, attualmente vuoto
	ngOnInit() {}
}
