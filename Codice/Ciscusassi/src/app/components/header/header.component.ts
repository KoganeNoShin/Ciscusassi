import { Component, OnInit } from '@angular/core';
import {
	IonHeader,
	IonIcon,
	IonToolbar,
	IonButtons,
	IonButton,
	IonAvatar,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { personCircle } from 'ionicons/icons';

import { RouterModule } from '@angular/router';
import { AuthenticationService } from 'src/app/core/services/authentication.service';

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.scss'],
	imports: [
		IonAvatar,
		RouterModule,
		IonHeader,
		IonIcon,
		IonToolbar,
		IonButtons,
		IonButton,
	],
	standalone: true,
})
export class HeaderComponent implements OnInit {
	isItalian = true;
	role: string = '';
	avatar: string = '';

	constructor(private authService: AuthenticationService) {
		addIcons({ personCircle });
	}

	changeLanguage() {
		this.isItalian = !this.isItalian;
	}

	ngOnInit() {
		this.authService.role$.subscribe((role) => {
			this.role = role;
		});

		this.authService.avatar$.subscribe((avatar) => {
			this.avatar = avatar;
		});
	}
}
