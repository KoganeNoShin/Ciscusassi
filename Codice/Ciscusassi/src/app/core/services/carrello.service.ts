import { Injectable } from '@angular/core';
import { ProdottoRecord } from '../interfaces/Prodotto';

@Injectable({
	providedIn: 'root',
})
export class CarrelloService {
	private prodottiNelCarrello: ProdottoRecord[] = [];

	aggiungi(prodotto: ProdottoRecord) {
		this.prodottiNelCarrello.push(prodotto);
	}

	rimuovi(prodotto: ProdottoRecord) {
		const index = this.prodottiNelCarrello.findIndex(
			(p) => p.id_prodotto === prodotto.id_prodotto
		);
		if (index !== -1) {
			this.prodottiNelCarrello.splice(index, 1);
		}
	}

	getProdotti(): ProdottoRecord[] {
		return this.prodottiNelCarrello;
	}

	svuotaCarrello() {
		this.prodottiNelCarrello = [];
	}
}
