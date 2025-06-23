import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ProdottoRecord } from 'src/app/core/interfaces/Prodotto';
import { CarrelloService } from 'src/app/core/services/carrello.service';
import { Subscription } from 'rxjs';
import { IonButton } from '@ionic/angular/standalone';

@Component({
	selector: 'app-prodotto-menu',
	templateUrl: './prodotto-menu.component.html',
	styleUrls: ['./prodotto-menu.component.scss'],
	standalone: true,
	imports: [IonButton],
})
export class ProdottoMenuComponent implements OnInit, OnDestroy {
	@Input() prodotto!: ProdottoRecord;
	@Input() isPiattoGiorno: boolean = false;
	@Input() isOrdinazione: boolean = false;

	quantity: number = 0;
	private carrelloSub!: Subscription;

	constructor(private carrelloService: CarrelloService) {}

	ngOnInit() {
		this.carrelloSub = this.carrelloService.prodotti$.subscribe(
			(prodotti) => {
				this.quantity = prodotti.filter(
					(p) => p.id_prodotto === this.prodotto.id_prodotto
				).length;
			}
		);
	}

	aggiungiAlCarrello(prodotto: ProdottoRecord) {
		this.carrelloService.aggiungi(prodotto);
	}

	rimuoviDalCarrello(prodotto: ProdottoRecord) {
		this.carrelloService.rimuovi(prodotto);
	}

	ngOnDestroy() {
		if (this.carrelloSub) this.carrelloSub.unsubscribe();
	}
}
