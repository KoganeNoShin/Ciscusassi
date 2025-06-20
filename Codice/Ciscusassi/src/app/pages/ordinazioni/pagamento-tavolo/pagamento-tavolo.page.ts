import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CarrelloService } from 'src/app/core/services/carrello.service';
import { Router } from '@angular/router';
import {
	IonContent,
	IonGrid,
	IonRow,
	IonCol,
	IonImg,
	IonCard,
	IonCardContent,
	IonButton,
	IonText,
} from '@ionic/angular/standalone';

@Component({
	selector: 'app-pagamento-tavolo',
	templateUrl: './pagamento-tavolo.page.html',
	styleUrls: ['./pagamento-tavolo.page.scss'],
	standalone: true,
	imports: [
    RouterModule,
		IonText,
		IonButton,
		IonCardContent,
		IonCard,
		IonImg,
		IonCol,
		IonRow,
		IonContent,
		CommonModule,
		FormsModule,
		IonGrid,
	],
})
export class PagamentoTavoloPage implements OnInit {
    totale: number = 0;
    codice: string = '';

	constructor(private servizioCarrello: CarrelloService, private router: Router) {}

	ngOnInit() {}

	pagaCassa(){
		console.log(this.servizioCarrello.getProdotti());
  		this.codice = this.servizioCarrello.getProdotti().map(p => 'P' + p.id_prodotto).join('');
		this.router.navigate(['/pagamento-cassa'], { queryParams: { codice: this.codice } });

	}

}
