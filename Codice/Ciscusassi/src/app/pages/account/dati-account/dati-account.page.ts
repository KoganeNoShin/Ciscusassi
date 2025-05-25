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
	IonCardContent,
	IonLabel,
	IonItem,
	IonList,
	IonSpinner,
} from '@ionic/angular/standalone';

import { RouterModule } from '@angular/router';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { ApiResponse } from 'src/app/core/interfaces/ApiResponse';

@Component({
	selector: 'app-dati-account',
	templateUrl: './dati-account.page.html',
	styleUrls: ['./dati-account.page.scss'],
	standalone: true,
	imports: [
		IonSpinner,
		IonCardContent,
		IonContent,
		IonGrid,
		IonCol,
		IonRow,
		IonImg,
		IonCard,
		IonText,
		IonButton,
		RouterModule,
	],
})
export class DatiAccountPage implements OnInit {
	username: string = '';
	avatar: string = '';
	points: number = 0;

	loading: boolean = true;
	error: boolean = false;
	errorMsg: string = '';

	constructor(private authService: AuthenticationService) {}

	ngOnInit() {
		this.authService.username$.subscribe((username) => {
			this.username = username;
		});

		this.authService.avatar$.subscribe((avatar) => {
			this.avatar = avatar;
		});

		this.authService.getPoints().subscribe({
			next: (response) => this.handleResponse(response),
			error: (err) => {
				console.log(err);
				this.error = true;
				this.loading = false;
			},
		});
	}

	private handleResponse(response: ApiResponse<number>): void {
		console.log(response);

		if (response.success && response.data) {
			this.points = response.data;
		} else {
			console.error(response.message || 'Errore sconosciuto');
			this.error = true;
			this.errorMsg = response.message ?? 'Errore sconosciuto';
		}

		this.loading = false;
	}

	logout() {
		console.log('logout');
	}

	deleteAccount() {
		console.log('delete account');
	}
}
