import { Component, importProvidersFrom, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarrelloService } from 'src/app/core/services/carrello.service';
import { ActivatedRoute } from '@angular/router';
import { ProdottoRecord } from 'src/app/core/interfaces/Prodotto';
import {
	IonContent,
	IonHeader,
	IonTitle,
	IonToolbar,
	IonGrid,
	IonRow,
	IonCol,
	IonCard,
	IonCardContent,
  IonButton,
  IonImg
} from '@ionic/angular/standalone';

@Component({
	selector: 'app-pagamento-cassa',
	templateUrl: './pagamento-cassa.page.html',
	styleUrls: ['./pagamento-cassa.page.scss'],
	standalone: true,
	imports: [
    IonContent,
    CommonModule,
    FormsModule,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonImg
],
})
export class PagamentoCassaPage implements OnInit {
  totale: number = 0;
  numeroTavolo: number = 0;
  prodottiNelCarrello: ProdottoRecord[] = [];
  codice: string = '';

	constructor(private route: ActivatedRoute) {
    this.route.queryParams.subscribe(params => {
    this.codice = params['codice'] || '';
    console.log('Codice ricevuto:', this.codice);
  });
}

	ngOnInit() {
  }

}
