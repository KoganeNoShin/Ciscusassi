import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
	IonContent,
	IonHeader,
	IonTitle,
	IonToolbar,
  IonButton,
  IonCard,
  IonIcon,
  IonInput
} from '@ionic/angular/standalone';

@Component({
	selector: 'app-modifica-dati-dipendenti',
	templateUrl: './modifica-dati-dipendenti.page.html',
	styleUrls: ['./modifica-dati-dipendenti.page.scss'],
	standalone: true,
	imports: [
		IonContent,
    IonButton,
    IonCard,
    IonIcon,
    IonInput,
		IonHeader,
		IonTitle,
		IonToolbar,
		CommonModule,
		FormsModule,
	],
})
export class ModificaDatiDipendentiPage implements OnInit {
	constructor() {}

	ngOnInit() {}
}
