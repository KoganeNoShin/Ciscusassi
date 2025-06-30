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
import { PrenotazioneService } from 'src/app/core/services/prenotazione.service';

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
	numeroOrdine: number | null = null;

	isLoading: boolean = true;

	// Numero del tavolo (può essere usato in seguito)
	numeroTavolo: number | null = null;

	// Prodotti nel carrello (da usare o popolare in futuro)
	prodotti: OrdProdEstended[] = [];

	// Codice ricevuto dalla query string della URL
	codice: string = '';

	// Costruttore con ActivatedRoute per leggere i parametri GET dalla URL
	constructor(
		private tavoloService: TavoloService,
		private prenotazioneService: PrenotazioneService
	) { }

	// Hook di inizializzazione, attualmente vuoto
	ngOnInit() {
		this.ngViewWillEnter();
	}

	ngViewWillEnter() {
		this.numeroTavolo = this.tavoloService.getNumeroTavolo();
		this.numeroOrdine = this.tavoloService.getNumeroOrdine();
		if (this.numeroOrdine !== null && this.numeroOrdine !== undefined) {
			this.prenotazioneService.getTotaleByOrdine(this.numeroOrdine).subscribe((response: any) => {
				this.totale = response?.data?.totale ?? 0;
			});
		} else {
			this.totale = 0;
		}
		this.prodotti = this.tavoloService.getOrdini();
		const numeroOrdine = this.tavoloService.getNumeroOrdine();
		this.codice = numeroOrdine !== null && numeroOrdine !== undefined ? `ordine: ${numeroOrdine}` : '';
	}
}
