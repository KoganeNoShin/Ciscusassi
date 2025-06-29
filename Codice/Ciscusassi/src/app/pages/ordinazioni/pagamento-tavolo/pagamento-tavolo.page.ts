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

	// Codice generato per il pagamento
	codice: string = '';

	// Costruttore: inietta il servizio carrello e il router
	constructor(
		private servizioCarrello: CarrelloService,
		private router: Router
	) {}

	// Metodo chiamato all’inizializzazione del componente
	ngOnInit() {}

	// Metodo che gestisce il pagamento alla cassa
	pagaCassa() {
		// Stampa i prodotti attualmente presenti nel carrello
		console.log(this.servizioCarrello.getProdotti());

		// Genera un codice univoco concatenando "P" con gli ID dei prodotti
		this.codice = this.servizioCarrello
			.getProdotti()
			.map((p) => 'P' + p.id_prodotto)
			.join('');

		// Naviga alla pagina di pagamento, passando il codice come parametro
		this.router.navigate(['/pagamento-cassa'], {
			queryParams: { codice: this.codice },
		});
	}
}
