import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
	IonContent,
	IonHeader,
	IonTitle,
	IonToolbar,
	IonCol,
	IonImg,
	IonGrid,
	IonRow,
	IonCard,
	IonCardContent,
	IonList,
	IonItem,
	IonText,
	IonDatetimeButton,
	IonModal,
	IonDatetime,
	IonButton,
} from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { CarrelloService } from 'src/app/core/services/carrello.service';
import { ProdottoRecord } from 'src/app/core/interfaces/Prodotto';
import { AsportoService } from 'src/app/core/services/asporto.service';
import { AsportoInput } from 'src/app/core/interfaces/Asporto';
import { FilialeAsportoService } from 'src/app/core/services/filiale-asporto.service';

@Component({
	selector: 'app-pagamento-asporto',
	templateUrl: './pagamento-asporto.page.html',
	styleUrls: ['./pagamento-asporto.page.scss'],
	standalone: true,
	imports: [
		IonButton,
		IonText,
		IonCardContent,
		IonCard,
		IonRow,
		IonGrid,
		IonImg,
		IonCol,
		IonContent,
		CommonModule,
		FormsModule,
		RouterModule,
	],
})
export class PagamentoAsportoPage implements OnInit {
	prodottiNelCarrello: ProdottoRecord[] = [];
	totale: number = 0;

	nuovoAsporto: AsportoInput = {
		indirizzo: '',
		data_ora_consegna: '',
		ref_cliente: 1,
		importo: 0,
		data_ora_pagamento: '',
		prodotti: [],
	};

	indirizzo: string = '';
	tempo: number = 0;
	ora_attuale: string = '';
	ora_consegna: string = '';

	constructor(
		private servizioCarrello: CarrelloService,
		private servizioAsporto: AsportoService,
		private filialeAsportoService: FilialeAsportoService
	) {}

	ngOnInit() {
		this.prodottiNelCarrello = this.servizioCarrello.getProdotti();
		this.totale = parseFloat(this.prodottiNelCarrello.reduce((acc, prodotto) => acc + prodotto.costo, 0).toFixed(2));
		this.indirizzo = this.filialeAsportoService.indirizzoUtente ?? '';
		this.tempo = this.filialeAsportoService.travelTimeMinutes ?? 0;

		const now = new Date();
		const consegna = new Date(now);
		consegna.setMinutes(now.getMinutes() + this.tempo + 2); // aggiungi tempo + margine

		this.ora_attuale = now.toLocaleString('sv-SE'); // formato ISO locale
		this.ora_consegna = consegna.toLocaleString('sv-SE');
	}

	svuotaCarrello() {
		this.aggiungiAsporto();
	}

	aggiungiAsporto() {
		const now = new Date();
		const consegna = new Date(now);
		consegna.setMinutes(now.getMinutes() + this.tempo + 2); // aggiungi tempo + margine

		this.ora_attuale = now.toLocaleString('sv-SE');
		this.ora_consegna = consegna.toLocaleString('sv-SE');

		this.nuovoAsporto.indirizzo = this.indirizzo;
		this.nuovoAsporto.data_ora_pagamento = this.ora_attuale;
		this.nuovoAsporto.data_ora_consegna = this.ora_consegna;
		this.nuovoAsporto.prodotti = this.prodottiNelCarrello.map(
			(prodotto) => prodotto.id_prodotto
		);
		this.nuovoAsporto.importo = this.totale;

		this.servizioAsporto.addProdotto(this.nuovoAsporto).subscribe({
			next: () => {
				console.log('Ordine aggiunto con successo');
				this.servizioCarrello.svuotaCarrello();
			},
			error: (err) => {
				console.error('Errore aggiungendo ordine:', err);
			},
		});
	}
}
