import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-pagamento-tavolo',
  templateUrl: './pagamento-tavolo.page.html',
  styleUrls: ['./pagamento-tavolo.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class PagamentoTavoloPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
