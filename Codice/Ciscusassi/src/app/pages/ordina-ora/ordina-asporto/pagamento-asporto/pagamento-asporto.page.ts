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
import { Router, RouterModule } from '@angular/router';
import { CarrelloService } from 'src/app/core/services/carrello.service';
import { ProdottoRecord } from 'src/app/core/interfaces/Prodotto';
import { AsportoService } from 'src/app/core/services/asporto.service';
import { AsportoInput } from 'src/app/core/interfaces/Asporto';
import { FilialeAsportoService } from 'src/app/core/services/filiale-asporto.service';
import { FilialeRecord } from 'src/app/core/interfaces/Filiale';

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
		ref_cliente: 0,
		importo: 0,
		data_ora_pagamento: '',
		prodotti: [],
	};
	indirizzo: any;
	tempo: any;
	ora_attuale: any;
	ora_consegna: any;

	constructor(
		private servizioCarrello: CarrelloService,
		private servizioAsporto: AsportoService,
		private filialeAsportoService: FilialeAsportoService
	) {}

	ngOnInit() {
		this.prodottiNelCarrello = this.servizioCarrello.getProdotti();
		this.totale = this.prodottiNelCarrello.reduce(
			(acc, prodotto) => acc + prodotto.costo,
			0
		);
		this.indirizzo = this.filialeAsportoService.closestFiliale?.indirizzo;
		this.tempo = this.filialeAsportoService.travelTimeMinutes;
		this.ora_attuale = new Date().toISOString();
		this.ora_consegna = new Date(
			new Date(this.ora_attuale).getTime() + this.tempo * 60000
		).toISOString();
	}

	svuotaCarrello() {
		this.aggiungiAsporto();
		this.servizioCarrello.svuotaCarrello();
	}

	aggiungiAsporto() {
    this.nuovoAsporto.indirizzo = this.indirizzo;
    this.nuovoAsporto.data_ora_consegna = this.ora_consegna;
    this.nuovoAsporto.importo = this.totale;
    this.nuovoAsporto.data_ora_pagamento = new Date().toISOString();
    this.nuovoAsporto.prodotti = this.prodottiNelCarrello.map(p => p.id_prodotto);

    this.servizioAsporto.addProdotto(this.nuovoAsporto).subscribe({
        next: () => {
            console.log('Ordine aggiunto con successo');
            this.servizioCarrello.svuotaCarrello();
        },
        error: (err) => {
            console.error('Errore aggiungendo ordine:', err);
        }
    });
}

}
