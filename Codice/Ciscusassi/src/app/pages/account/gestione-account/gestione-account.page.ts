import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
	IonContent,
	IonGrid,
	IonCol,
	IonRow,
	IonImg,
	IonCard,
	IonText,
	IonButton,
} from '@ionic/angular/standalone';

import { RouterModule } from '@angular/router';

@Component({
	selector: 'app-login',
	templateUrl: './gestione-account.page.html',
	styleUrls: ['./gestione-account.page.scss'],
	standalone: true,
	imports: [
		RouterModule,
		IonButton,
		IonText,
		IonCard,
		IonImg,
		IonRow,
		IonCol,
		IonGrid,
		IonContent,
		CommonModule,
		FormsModule,
	],
})
export class GestioneAccountPage implements OnInit {
	constructor() {}

	ngOnInit() {}
}
