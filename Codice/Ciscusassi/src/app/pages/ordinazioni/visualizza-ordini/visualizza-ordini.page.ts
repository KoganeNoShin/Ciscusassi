import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
	IonContent,
	IonHeader,
	IonTitle,
	IonToolbar,
	IonButton,
} from '@ionic/angular/standalone';
import { CarrelloService } from 'src/app/core/services/carrello.service';
import { OrdProdEstended } from 'src/app/core/interfaces/OrdProd';
import { Router, RouterModule } from '@angular/router';
import { ProdottoOrdineComponent } from 'src/app/components/prodotto-ordine/prodotto-ordine.component';
import { ListaOrdiniComponent } from '../../../components/lista-ordini/lista-ordini.component';
import { Observable, of, firstValueFrom } from 'rxjs';
import { OrdineService } from 'src/app/core/services/ordine.service';
import { TavoloService } from 'src/app/core/services/tavolo.service';

@Component({
	selector: 'app-visualizza-ordini',
	templateUrl: './visualizza-ordini.page.html',
	styleUrls: ['./visualizza-ordini.page.scss'],
	standalone: true,
	imports: [
		RouterModule,
		IonButton,
		IonContent,
		CommonModule,
		FormsModule,
		ListaOrdiniComponent,
	],
})
export class VisualizzaOrdiniPage implements OnInit {
	private intervalAggiornamento: any;
	prodotti$: Observable<OrdProdEstended[]> = of([]);
	constructor(private router: Router, private ordineService: OrdineService, private tavoloService: TavoloService) {}
	terminaServizio() {
		//implemetare la logica per controllare se tutti i prodotti sono stati consegnati
		//altrimenti mostrare un messaggio di errore tramite toast
		this.router.navigate(['/pagamento-tavolo']);
	}

	ngOnInit() {
		this.ngViewWillEnter();
	}

	ngViewWillEnter(){
		this.loadOrdini();
		this.intervalAggiornamento = setInterval(() => this.loadOrdini(), 30000);
	}

	ngOnDestroy(){
		if (this.intervalAggiornamento) {
			clearInterval(this.intervalAggiornamento);
		}
	}

	async loadOrdini(){
		const numeroOrdine = this.tavoloService.getNumeroOrdine();
		if (numeroOrdine === null) {
			console.error('Numero ordine non disponibile');
			return;
		}
		const response = await firstValueFrom(
			this.ordineService.getProdottiOrdinatiByNumeroOrdine(numeroOrdine)
		);

		if (!response.success || !response.data) {
			this.prodotti$ = of([]);
		} else {
			const prodotti = Array.isArray(response.data)
				? response.data.filter((item): item is OrdProdEstended => !!item)
				: [response.data];
			this.prodotti$ = of(prodotti);
		}
	}
}
