import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
	IonContent,
	IonCard,
	IonCardContent,
	IonText,
	IonGrid,
	IonCol,
	IonImg,
	IonRow,
} from '@ionic/angular/standalone';

import { HeroComponent } from '../../components/hero/hero.component';
import { LeafletMapComponent } from '../../components/leaflet-map/leaflet-map.component';

@Component({
	selector: 'app-ristoranti',
	templateUrl: './ristoranti.page.html',
	styleUrls: ['./ristoranti.page.scss'],
	standalone: true,
	imports: [
		IonRow,
		IonImg,
		IonCol,
		IonGrid,
		IonText,
		IonCardContent,
		IonCard,
		IonContent,
		CommonModule,
		HeroComponent,
		LeafletMapComponent,
	],
})
export class RistorantiPage implements OnInit {
	ngOnInit() {}

	constructor() {}
}
