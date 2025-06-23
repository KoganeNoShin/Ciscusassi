import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
	IonButton,
	IonCard,
	IonCol,
	IonContent,
	IonGrid,
	IonHeader,
	IonImg,
	IonRow,
	IonText,
	IonTitle,
	IonToolbar,
} from '@ionic/angular/standalone';
import { Router } from 'express';
import { RouterModule } from '@angular/router';
import { AuthenticationService } from 'src/app/core/services/authentication.service';

@Component({
	selector: 'app-amministrazione',
	templateUrl: './amministrazione.page.html',
	styleUrls: ['./amministrazione.page.scss'],
	standalone: true,
	imports: [
		IonContent,
		IonGrid,
		IonRow,
		IonCol,
		IonImg,
		IonCard,
		IonButton,
		CommonModule,
		FormsModule,
		RouterModule,
	],
})
export class AmministrazionePage implements OnInit {
	username: string = '';

	constructor(private authService: AuthenticationService) {}

	ngOnInit() {
		this.authService.username$.subscribe((username) => {
			this.username = username;
		});
	}
}
