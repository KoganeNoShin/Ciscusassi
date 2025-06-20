import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
	IonImg,
  IonButton,
  IonText,
} from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';

@Component({
	selector: 'app-pagamento-carta',
	templateUrl: './pagamento-carta.page.html',
	styleUrls: ['./pagamento-carta.page.scss'],
	standalone: true,
	imports: [
    RouterModule,
    IonImg,
    IonCardContent,
    IonCard,
    IonRow,
    IonContent,
    CommonModule,
    FormsModule,
    IonGrid,
    IonRow,
    IonCol,
    IonButton
],
})
export class PagamentoCartaPage implements OnInit {
	constructor() {}

	ngOnInit() {}
}
