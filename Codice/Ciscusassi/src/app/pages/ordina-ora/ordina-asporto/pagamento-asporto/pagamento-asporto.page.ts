import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCol, IonImg, IonGrid, IonRow, IonCard, IonCardContent, IonList, IonItem, IonText, IonDatetimeButton, IonModal, IonDatetime, IonButton } from '@ionic/angular/standalone';
import { Router, RouterModule } from '@angular/router';
import { CarrelloService } from 'src/app/core/services/carrello.service';
import { ProdottoRecord } from 'src/app/core/interfaces/Prodotto';

@Component({
  selector: 'app-pagamento-asporto',
  templateUrl: './pagamento-asporto.page.html',
  styleUrls: ['./pagamento-asporto.page.scss'],
  standalone: true,
  imports: [IonButton, IonText, IonCardContent, IonCard, IonRow, IonGrid, IonImg, IonCol, IonContent, CommonModule, FormsModule, RouterModule]
})
export class PagamentoAsportoPage implements OnInit {
  prodottiNelCarrello: ProdottoRecord[] = [];
  totale: number = 0;

  constructor(private servizioCarrello: CarrelloService) { }  

  ngOnInit() {
    this.prodottiNelCarrello = this.servizioCarrello.getProdotti();    
    this.totale = this.prodottiNelCarrello.reduce((acc, prodotto) => acc + prodotto.costo, 0);
  }

  svuotaCarrello(){
    this.servizioCarrello.svuotaCarrello();
  }

}
