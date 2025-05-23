import { Component, OnInit, Input } from '@angular/core';
import { ProdottoRecord } from 'src/app/core/interfaces/Prodotto';
import { IonButton, IonCol, IonGrid, IonRow } from "@ionic/angular/standalone";
import { CarrelloService } from 'src/app/core/services/carrello.service';

@Component({
  selector: 'app-prodotto-menu',
  templateUrl: './prodotto-menu.component.html',
  styleUrls: ['./prodotto-menu.component.scss'],
  standalone: true,
  imports: [ 
    IonButton
  ]
})
export class ProdottoMenuComponent  implements OnInit {
  @Input() prodotto!: ProdottoRecord;
  @Input() isPiattoGiorno: boolean = false;
  @Input() isOrdinazione: boolean = false;
  carrello: ProdottoRecord[] = [];
  quantity: number = 0;

  constructor(private carrelloService: CarrelloService) { }

  ngOnInit() { 
    this.aggiornaQuantita();
   }

  aggiungiAlCarrello(prodotto: ProdottoRecord) {
    this.carrelloService.aggiungi(prodotto);
    this.aggiornaQuantita();
    this.mostraCarrello();
  }

  rimuoviDalCarrello(prodotto: ProdottoRecord) {
    this.carrelloService.rimuovi(prodotto);
    this.aggiornaQuantita();
    this.mostraCarrello();
  }

  aggiornaQuantita() {
  const carrello = this.carrelloService.getProdotti(); // prendi tutti i prodotti nel carrello
  this.quantity = carrello.filter(p => p.id_prodotto === this.prodotto.id_prodotto).length;
}

  mostraCarrello() {
    console.log(this.carrelloService.getProdotti());
  }

}
