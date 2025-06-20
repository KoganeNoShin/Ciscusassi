import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-pagamento-carta',
  templateUrl: './pagamento-carta.page.html',
  styleUrls: ['./pagamento-carta.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class PagamentoCartaPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
