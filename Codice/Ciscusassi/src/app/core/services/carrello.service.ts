import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProdottoRecord } from '../interfaces/Prodotto';

@Injectable({
	providedIn: 'root',
})
export class CarrelloService {
	// Stato interno del carrello come BehaviorSubject
	private prodottiSubject = new BehaviorSubject<ProdottoRecord[]>([]);

	// Observable pubblico per iscriversi ai cambiamenti
	public prodotti$ = this.prodottiSubject.asObservable();

	constructor() {}

	/**
	 * Aggiunge un prodotto al carrello.
	 * @remarks
	 * La seguente funzione è utilizzata per aggiungere un prodotto al carrello.
	 * @param prodotto - Il prodotto da aggiungere, rappresentato da un oggetto di tipo {@link ProdottoRecord}.
	 */
	aggiungi(prodotto: ProdottoRecord) {
		const attuale = this.prodottiSubject.value;
		this.prodottiSubject.next([...attuale, prodotto]);
	}

	/**
	 * Rimuove un prodotto dal carrello.
	 *
	 * @remarks
	 * Questa funzione cerca e rimuove un'istanza del prodotto specificato,
	 * identificata tramite `id_prodotto`, dall'elenco corrente dei prodotti nel carrello.
	 * Se il prodotto è presente, viene rimosso e l'elenco aggiornato viene notificato agli osservatori.
	 *
	 * @param prodotto - Il prodotto da rimuovere, rappresentato da un oggetto di tipo {@link ProdottoRecord}.
	 */
	rimuovi(prodotto: ProdottoRecord) {
		const attuale = [...this.prodottiSubject.value];
		const index = attuale.findIndex(
			(p) => p.id_prodotto === prodotto.id_prodotto
		);
		if (index !== -1) {
			attuale.splice(index, 1);
			this.prodottiSubject.next(attuale);
		}
	}

	/**
	 * Restituisce i prodotti attualmente presenti nel carrello.
	 *
	 * @remarks
	 * Questa funzione ppermette di ottenere l'elenco dei prodotti attualmente presenti nel carrello.
	 * @returns Un array di oggetti {@link ProdottoRecord} che rappresentano i prodotti nel carrello.
	 */
	getProdotti(): ProdottoRecord[] {
		return this.prodottiSubject.value;
	}

	/**
	 * Svuota il carrello, rimuovendo tutti i prodotti attualmente presenti.
	 *
	 * @remarks
	 * Questa funzione ppermette di svuotare il carrello
	 */
	svuotaCarrello() {
		this.prodottiSubject.next([]);
	}
}
