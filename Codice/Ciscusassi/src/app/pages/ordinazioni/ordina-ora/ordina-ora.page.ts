import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
	IonContent,
	IonButton,
	IonImg,
	IonRow,
	IonCol,
	IonText,
} from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';

@Component({
	selector: 'app-ordina-ora',
	templateUrl: './ordina-ora.page.html',
	styleUrls: ['./ordina-ora.page.scss'],
	standalone: true,
	imports: [
		IonText,
		RouterModule,
		IonCol,
		IonRow,
		IonImg,
		IonButton,
		IonContent,
		CommonModule,
		FormsModule,
	],
})
export class OrdinaOraPage implements OnInit {
	constructor() {}

	ngOnInit() {}
}
