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

  // Aggiunge un prodotto al carrello
  aggiungi(prodotto: ProdottoRecord) {
    const attuale = this.prodottiSubject.value;
    this.prodottiSubject.next([...attuale, prodotto]);
  }

  // Rimuove la prima occorrenza di un prodotto
  rimuovi(prodotto: ProdottoRecord) {
    const attuale = [...this.prodottiSubject.value];
    const index = attuale.findIndex(p => p.id_prodotto === prodotto.id_prodotto);
    if (index !== -1) {
      attuale.splice(index, 1);
      this.prodottiSubject.next(attuale);
    }
  }

  // Restituisce i prodotti attuali (non reattivo)
  getProdotti(): ProdottoRecord[] {
    return this.prodottiSubject.value;
  }

  // Svuota completamente il carrello
  svuotaCarrello() {
    this.prodottiSubject.next([]);
  }
}
