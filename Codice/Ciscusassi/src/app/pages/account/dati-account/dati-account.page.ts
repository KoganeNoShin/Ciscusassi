import { Component, OnInit } from '@angular/core';

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
	IonSpinner,
	IonAvatar,
	NavController,
} from '@ionic/angular/standalone';

import { RouterModule } from '@angular/router';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { ApiResponse } from 'src/app/core/interfaces/ApiResponse';

import { Router } from '@angular/router';

@Component({
	selector: 'app-dati-account',
	templateUrl: './dati-account.page.html',
	styleUrls: ['./dati-account.page.scss'],
	standalone: true,
	imports: [
		IonAvatar,
		IonSpinner,
		IonCardContent,
		IonContent,
		IonGrid,
		IonCol,
		IonRow,
		IonImg,
		IonCard,
		IonButton,
		RouterModule,
		IonAvatar,
		IonText,
	],
})
export class DatiAccountPage implements OnInit {
	username: string = '';
	role: string = '';
	avatar: string = '';
	points: number = 0;

	loading: boolean = true;
	loadingLogout: boolean = false;

	error: boolean = false;
	errorMsg: string = '';

	constructor(
		private authService: AuthenticationService,
		private router: Router,
		private navigator: NavController
	) {}

	ngOnInit() {
		this.authService.username$.subscribe((username) => {
			this.username = username;
		});

		this.authService.role$.subscribe((role) => {
			this.role = role;
		});

		this.authService.avatar$.subscribe((avatar) => {
			this.avatar = avatar;
		});

		if (this.role == 'cliente') {
			this.authService.getPoints().subscribe({
				next: (response) => this.handleResponse(response),
				error: (err) => {
					console.log(err);
					this.error = true;
					this.loading = false;
				},
			});
		}
	}

	private handleResponse(response: ApiResponse<number>): void {
		console.log(response);

		if (response.success) {
			this.points = response.data!;
		} else {
			console.error(response.message || 'Errore sconosciuto');
			this.error = true;
			this.errorMsg = response.message ?? 'Errore sconosciuto';
		}

		this.loading = false;
	}

	async logout() {
		this.loadingLogout = true;
		try {
			await this.authService.logout();
			this.loadingLogout = false;
			this.router.navigate(['/login']);
		} catch (err) {
			console.error('Errore durante il logout:', err);
			this.error = true;
			this.errorMsg = 'Errore durante il logout. Riprova più tardi.';
			this.loadingLogout = false;
		}
	}
}
