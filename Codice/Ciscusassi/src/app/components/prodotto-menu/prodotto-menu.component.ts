import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ProdottoRecord } from 'src/app/core/interfaces/Prodotto';
import { CarrelloService } from 'src/app/core/services/carrello.service';
import { Subscription } from 'rxjs';
import { IonButton, IonText, IonImg } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

/**
 * Questo componente viene utilizando quando l'utente sta sfogliando il menu,
 * sia durante la visita al menu che durante l'ordinazione vera e propria.
 *
 * Permette all'utente di aggiungere o rimuovere un prodotto specifico al "carrello" delle ordinazioni.
 *
 * @param prodotto - Il {@link ProdottoRecord} assegnato all'istanza del componente.
 * @param isPiattoGiorno - Booleano che rappresenta se questo è il piatto del giorno, per poter cambiare colore ecc nell'html.
 * @param isOrdinazione - Booleano che rappresenta se siamo in schermata di ordinazione, in modo tale da fare apparire anche i pulsanti per aggiungere o rimuovere il prodotto dal carrello.
 */
@Component({
	selector: 'app-prodotto-menu',
	templateUrl: './prodotto-menu.component.html',
	styleUrls: ['./prodotto-menu.component.scss'],
	standalone: true,
	imports: [IonImg, IonText, IonButton, CommonModule],
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
