import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
	IonContent,
	IonHeader,
	IonTitle,
	IonToolbar,
	IonButton,
} from '@ionic/angular/standalone';
import { CarrelloService } from 'src/app/core/services/carrello.service';
import { ProdottoRecord } from 'src/app/core/interfaces/Prodotto';
import { Router, RouterModule } from '@angular/router';


@Component({
	selector: 'app-visualizza-ordini',
	templateUrl: './visualizza-ordini.page.html',
	styleUrls: ['./visualizza-ordini.page.scss'],
	standalone: true,
	imports: [
		RouterModule,
		IonButton,
		IonContent,
		CommonModule,
		FormsModule,
	],
})
export class VisualizzaOrdiniPage implements OnInit {
	prodotti: ProdottoRecord[] = [];

	constructor(private servizioCarrello: CarrelloService, private router: Router) {
		servizioCarrello.prodotti$.subscribe((prodotti) => {
			this.prodotti = prodotti;
		});
	}
  
	terminaServizio(){
		//implemetare la logica per controllare se tutti i prodotti sono stati consegnati
		//altrimenti mostrare un messaggio di errore tramite toast
		this.router.navigate(['/home']);
	}

	ngOnInit() {}
}
