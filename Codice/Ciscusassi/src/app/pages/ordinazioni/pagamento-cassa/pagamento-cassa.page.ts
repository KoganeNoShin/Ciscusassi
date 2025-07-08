import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
	IonSpinner,
	IonContent,
	IonGrid,
	IonRow,
	IonCol,
	IonCard,
	IonImg,
	IonText,
} from '@ionic/angular/standalone';

import { TavoloService } from 'src/app/core/services/tavolo.service';
import { OrdProdEstended } from 'src/app/core/interfaces/OrdProd';

/**
 * 	Questa pagina serve per mostrare all'utente il fatto che debba effettuare il pagamento alla cassa,
 *  mostrando il codice a barre da fare scansionare al cameriere nella cassa (non prevista nell'app)
 */
@Component({
	selector: 'app-pagamento-cassa',
	templateUrl: './pagamento-cassa.page.html',
	styleUrls: ['./pagamento-cassa.page.scss'],
	standalone: true,
	imports: [
		IonText,
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
	totale: number = 0;
	numeroOrdine: number | null = null;

	/** Il codice a barre */
	codice: string = '';

	isLoading: boolean = true;

	constructor(private tavoloService: TavoloService) {}

	ngOnInit() {
		this.ngViewWillEnter();
	}

	ngViewWillEnter() {
		this.isLoading = true;

		this.numeroOrdine = this.tavoloService.getNumeroOrdine();
		this.totale = this.tavoloService.getTotaleQuery();

		this.isLoading = false;
		this.codice =
			this.numeroOrdine !== null && this.numeroOrdine !== undefined
				? `ordine: ${this.numeroOrdine}`
				: '';
	}
}
