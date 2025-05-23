import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCol, IonImg, IonGrid, IonRow, IonCard, IonCardContent, IonList, IonItem, IonText, IonDatetimeButton, IonModal, IonDatetime, IonButton } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-pagamento-asporto',
  templateUrl: './pagamento-asporto.page.html',
  styleUrls: ['./pagamento-asporto.page.scss'],
  standalone: true,
  imports: [IonButton, IonText, IonCardContent, IonCard, IonRow, IonGrid, IonImg, IonCol, IonContent, CommonModule, FormsModule, RouterModule]
})
export class PagamentoAsportoPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
