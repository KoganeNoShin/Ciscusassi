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

// Import dei servizi e interfacce personalizzate
import { CarrelloService } from 'src/app/core/services/carrello.service';
import { ProdottoRecord } from 'src/app/core/interfaces/Prodotto';
import { AsportoService } from 'src/app/core/services/asporto.service';
import { AsportoInput } from 'src/app/core/interfaces/Asporto';
import { FilialeAsportoService } from 'src/app/core/services/filiale-asporto.service';
import { FilialeRecord } from 'src/app/core/interfaces/Filiale';

// Decoratore del componente standalone per Angular/Ionic
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
	// Array dei prodotti presenti nel carrello
	prodottiNelCarrello: ProdottoRecord[] = [];

	// Filiale più vicina trovata dal servizio
	filialePiuVicino: FilialeRecord | null = null;

	// Totale dei prodotti nel carrello
	totale: number = 0;

	// Oggetto che rappresenta un nuovo ordine da asporto
	nuovoAsporto: AsportoInput = {
		indirizzo: '',
		data_ora_consegna: '',
		ref_cliente: 1,
		importo: 0,
		data_ora_pagamento: '',
		prodotti: [],
		ref_filiale: 1,
	};

	// Indirizzo dell’utente
	indirizzo: string = '';

	// Tempo di viaggio calcolato fino alla filiale
	tempo: number = 0;

	// Timestamp dell’ora attuale e dell’ora prevista di consegna
	ora_attuale: string = '';
	ora_consegna: string = '';

	constructor(
		private servizioCarrello: CarrelloService,
		private servizioAsporto: AsportoService,
		private filialeAsportoService: FilialeAsportoService
	) {}

	// Hook eseguito all'inizializzazione del componente
	ngOnInit() {
		// Recupera i prodotti e calcola il totale
		this.prodottiNelCarrello = this.servizioCarrello.getProdotti();
		this.totale = parseFloat(
			this.prodottiNelCarrello
				.reduce((acc, prodotto) => acc + prodotto.costo, 0)
				.toFixed(2)
		);

		// Recupera dati da FilialeAsportoService: indirizzo utente e tempo stimato
		this.indirizzo = this.filialeAsportoService.indirizzoUtente ?? '';
		this.tempo = this.filialeAsportoService.travelTimeMinutes ?? 0;

		// Calcola ora attuale e ora di consegna stimata
		const now = new Date();
		const consegna = new Date(now);
		consegna.setMinutes(now.getMinutes() + this.tempo + 2); // +2 minuti di margine

		this.ora_attuale = this.formatDateNoSeconds(now);
		this.ora_consegna = this.formatDateNoSeconds(consegna);
	}

	// Formatta una data come stringa "YYYY-MM-DD HH:mm" senza secondi
	formatDateNoSeconds(date: Date): string {
		const pad = (n: number) => n.toString().padStart(2, '0');

		const year = date.getFullYear();
		const month = pad(date.getMonth() + 1);
		const day = pad(date.getDate());
		const hours = pad(date.getHours());
		const minutes = pad(date.getMinutes());

		return `${year}-${month}-${day} ${hours}:${minutes}`;
	}

	// Metodo per creare e inviare un nuovo ordine d’asporto
	aggiungiAsporto() {
		// Ricalcola orari aggiornati al momento della conferma
		const now = new Date();
		const consegna = new Date(now);
		consegna.setMinutes(now.getMinutes() + this.tempo + 2);

		this.ora_attuale = this.formatDateNoSeconds(now);
		this.ora_consegna = this.formatDateNoSeconds(consegna);

		// Popola l’oggetto AsportoInput con i dati correnti
		this.nuovoAsporto.indirizzo = this.indirizzo;
		this.nuovoAsporto.data_ora_pagamento = this.ora_attuale;
		console.log(this.nuovoAsporto.data_ora_pagamento);
		this.nuovoAsporto.data_ora_consegna = this.ora_consegna;
		console.log(this.nuovoAsporto.data_ora_consegna);

		// Assegna gli ID dei prodotti presenti nel carrello
		this.nuovoAsporto.prodotti = this.prodottiNelCarrello.map(
			(prodotto) => prodotto.id_prodotto
		);

		// Importo totale e riferimento filiale più vicina
		this.nuovoAsporto.importo = this.totale;
		const closestFiliale = this.filialeAsportoService.closestFiliale;
		this.nuovoAsporto.ref_filiale = closestFiliale
			? closestFiliale.id_filiale
			: 0;

		// Invia l’oggetto asporto al servizio backend
		this.servizioAsporto.addProdotto(this.nuovoAsporto).subscribe({
			next: () => {
				console.log('Ordine aggiunto con successo');
			},
			error: (err) => {
				console.error('Errore aggiungendo ordine:', err);
			},
		});
	}
}
