import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
	IonContent,
	IonHeader,
	IonTitle,
	IonToolbar,
	IonCard,
	IonGrid,
	IonRow,
	IonCol,
	IonCardContent,
	IonButton,
  IonImg, 
  IonText
} from '@ionic/angular/standalone';


@Component({
	selector: 'app-ringraziamenti-asporto',
	templateUrl: './ringraziamenti-asporto.page.html',
	styleUrls: ['./ringraziamenti-asporto.page.scss'],
	standalone: true,
	imports: [
    IonCardContent,
    IonCol,
    IonRow,
    IonCard,
    IonContent,
    CommonModule,
    FormsModule,
    IonGrid,
    IonImg
],
})
export class RingraziamentiAsportoPage implements OnInit {
	constructor() {}

	ngOnInit() {}
}
