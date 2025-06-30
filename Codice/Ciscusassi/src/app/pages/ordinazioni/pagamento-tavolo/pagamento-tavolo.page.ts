import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CarrelloService } from 'src/app/core/services/carrello.service'; // Servizio per gestire il carrello
import { Router } from '@angular/router'; // Per la navigazione tra pagine

import {
	IonContent,
	IonGrid,
	IonRow,
	IonCol,
	IonImg,
	IonCard,
	IonCardContent,
	IonButton,
	IonText,
} from '@ionic/angular/standalone';
import { TavoloService } from 'src/app/core/services/tavolo.service';
import { OrdProdEstended } from 'src/app/core/interfaces/OrdProd';
import { PrenotazioneService } from 'src/app/core/services/prenotazione.service';

@Component({
	selector: 'app-pagamento-tavolo',
	templateUrl: './pagamento-tavolo.page.html',
	styleUrls: ['./pagamento-tavolo.page.scss'],
	standalone: true,
	imports: [
		RouterModule,
		IonText,
		IonButton,
		IonCardContent,
		IonCard,
		IonImg,
		IonCol,
		IonRow,
		IonContent,
		CommonModule,
		FormsModule,
		IonGrid,
	],
})
export class PagamentoTavoloPage implements OnInit {
	// Proprietà per il totale dell’ordine
	totale: number = 0;
	prodotti: OrdProdEstended[] = [];

	// Codice generato per il pagamento
	codice: string = '';

	// Costruttore: inietta il servizio carrello e il router
	constructor(
		private servizioCarrello: CarrelloService,
		private router: Router,
		private tavoloService: TavoloService,
		private prenotazioneService: PrenotazioneService
	) {}

	// Metodo chiamato all’inizializzazione del componente
	ngOnInit() {
		const numeroOrdine = this.tavoloService.getNumeroOrdine();
		if (numeroOrdine !== null && numeroOrdine !== undefined) {
			this.prenotazioneService.getTotaleByOrdine(numeroOrdine).subscribe((response: any) => {
				// Assumendo che il totale sia in response.data.totale, modificare se necessario
				this.totale = response.data?.totale ?? 0;
			});
		} else {
			this.totale = 0;
		}
	}
}
