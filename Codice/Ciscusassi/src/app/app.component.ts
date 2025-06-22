import { Component } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

import {
	IonApp,
	IonMenuToggle,
	IonRouterOutlet,
} from '@ionic/angular/standalone';

import { HeaderComponent } from 'src/app/components/header/header.component';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { AuthenticationService } from './core/services/authentication.service';

import { Title } from '@angular/platform-browser';
import { filter } from 'rxjs/operators';

import { Router, NavigationEnd } from '@angular/router';
import { RouterModule } from '@angular/router';

import {
	IonContent,
	IonList,
	IonTitle,
	IonItem,
	IonMenu,
	IonHeader,
	IonToolbar,
	IonIcon,
	IonLabel,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
	home,
	newspaper,
	location,
	restaurant,
	calendar,
} from 'ionicons/icons';

@Component({
	selector: 'app-root',
	templateUrl: 'app.component.html',
	styleUrls: ['./app.component.scss'],
	imports: [
		IonApp,
		IonRouterOutlet,
		RouterModule,
		HeaderComponent,
		FooterComponent,
		IonMenu,
		IonTitle,
		IonContent,
		IonList,
		IonItem,
		IonHeader,
		IonToolbar,
		IonMenuToggle,
		IonIcon,
		IonLabel,
	],
})
export class AppComponent {
	constructor(
		private storage: Storage,
		private authService: AuthenticationService,
		private router: Router,
		private titleService: Title
	) {
		this.initStorage();
		this.router.events
			.pipe(filter((event) => event instanceof NavigationEnd))
			.subscribe(() => {
				const url = this.router.url;
				const lastSegment = url.split('/').filter(Boolean).pop();
				const capitalized = lastSegment
					? lastSegment[0].toUpperCase() + lastSegment.slice(1)
					: 'App';
				this.titleService.setTitle('Ciscusassi - ' + capitalized);
			});
		addIcons({ home, newspaper, location, restaurant, calendar });
	}

	async initStorage() {
		await this.storage.create();
		await this.authService.init();
	}
}
