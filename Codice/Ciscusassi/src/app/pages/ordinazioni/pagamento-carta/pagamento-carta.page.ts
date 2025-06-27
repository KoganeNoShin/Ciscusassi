import { Component, OnInit } from '@angular/core';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import {
	IonContent,
	IonGrid,
	IonRow,
	IonCol,
	IonCard,
	IonCardContent,
	IonButton,
	IonImg,
} from '@ionic/angular/standalone';

@Component({
	selector: 'app-pagamento-carta',
	templateUrl: './pagamento-carta.page.html',
	styleUrls: ['./pagamento-carta.page.scss'],
	standalone: true,
	imports: [
		IonImg,
		IonButton,
		IonCardContent,
		IonCard,
		IonCol,
		IonRow,
		IonGrid,
		IonContent,
	],
})
export class PagamentoCartaPage implements OnInit {	

	constructor() {}

	ngOnInit() {}

	generaRicevuta(){}
}
