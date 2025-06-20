import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-pagamento-cassa',
  templateUrl: './pagamento-cassa.page.html',
  styleUrls: ['./pagamento-cassa.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class PagamentoCassaPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
