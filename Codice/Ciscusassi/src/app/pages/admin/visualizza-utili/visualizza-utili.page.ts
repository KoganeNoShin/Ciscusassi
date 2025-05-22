import { Component, input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
	IonButton,
	IonCol,
	IonContent,
	IonGrid,
	IonHeader,
	IonInput,
	IonRow,
	IonSelect,
	IonSelectOption,
	IonTitle,
	IonToolbar,
} from '@ionic/angular/standalone';

@Component({
	selector: 'app-visualizza-utili',
	templateUrl: './visualizza-utili.page.html',
	styleUrls: ['./visualizza-utili.page.scss'],
	standalone: true,
	imports: [
		IonContent,
		IonHeader,
		IonTitle,
		IonToolbar,
		CommonModule,
		FormsModule,
		IonButton,
		IonGrid,
		IonRow,
		IonCol,
		IonSelect,
		IonSelectOption,
	],
})
export class VisualizzaUtiliPage implements OnInit {
	constructor() {}

	ngOnInit() {}

	months = [
		'Gennaio',
		'Febbraio',
		'Marzo',
		'Aprile',
		'Maggio',
		'Giugno',
		'Luglio',
		'Agosto',
		'Settembre',
		'Ottobre',
		'Novembre',
		'Dicembre',
	];

	rows = [
		{
			address: 'Via Vincenzo Piazza Martini, 45',
			values: Array(12).fill('- €'),
		},
		{ address: 'Via Palmerino , 52/A', values: Array(12).fill('- €') },
		{ address: 'Via Saitta Longhi, 116G', values: Array(12).fill('- €') },
		{ address: 'Via Catania, 17', values: Array(12).fill('- €') },
	];
	years = [2025, 2024, 2023, 2022, 2021]; // Puoi anche generarli dinamicamente
}
