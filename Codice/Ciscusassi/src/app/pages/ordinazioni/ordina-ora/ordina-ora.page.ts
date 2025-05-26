import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
	IonContent,
	IonButton,
	IonImg,
	IonRow,
	IonCol,
} from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { HeroComponent } from 'src/app/components/hero/hero.component';

@Component({
	selector: 'app-ordina-ora',
	templateUrl: './ordina-ora.page.html',
	styleUrls: ['./ordina-ora.page.scss'],
	standalone: true,
	imports: [
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
