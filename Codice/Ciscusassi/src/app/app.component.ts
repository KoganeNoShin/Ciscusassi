import { Component } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';

import { HeaderComponent } from 'src/app/components/header/header.component';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { AuthenticationService } from './core/services/authentication.service';

import { Title } from '@angular/platform-browser';
import { filter } from 'rxjs/operators';

import { Router, NavigationEnd } from '@angular/router';

@Component({
	selector: 'app-root',
	templateUrl: 'app.component.html',
	imports: [IonApp, IonRouterOutlet, HeaderComponent, FooterComponent],
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
	}

	async initStorage() {
		await this.storage.create();
		await this.authService.init();
	}
}
