import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
	IonContent,
	IonHeader,
	IonTitle,
	IonToolbar,
  IonCard, 
  IonIcon,
  IonInput,
  IonButton
} from '@ionic/angular/standalone';

@Component({
	selector: 'app-aggiungi-dipendenti',
	templateUrl: './aggiungi-dipendenti.page.html',
	styleUrls: ['./aggiungi-dipendenti.page.scss'],
	standalone: true,
	imports: [
		IonContent,
		IonHeader,
		IonTitle,
		IonToolbar,
		CommonModule,
		FormsModule,
    IonCard,
    IonIcon,
    IonInput,
    IonButton


	],
})
export class AggiungiDipendentiPage implements OnInit {
	constructor() {}

	ngOnInit() {}
}
