import { Component } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';

import { HeaderComponent } from 'src/app/components/header/header.component';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { AuthenticationService } from './core/services/authentication.service';

@Component({
	selector: 'app-root',
	templateUrl: 'app.component.html',
	imports: [IonApp, IonRouterOutlet, HeaderComponent, FooterComponent],
})
export class AppComponent {
	constructor(
		private storage: Storage,
		private authService: AuthenticationService
	) {
		this.initStorage();
	}

	async initStorage() {
		await this.storage.create();
		await this.authService.init();
	}
}
