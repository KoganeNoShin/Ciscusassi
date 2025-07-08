import { Component } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { HeroComponent } from 'src/app/components/hero/hero.component';

import { PiattoDelGiornoComponent } from 'src/app/components/piatto-del-giorno/piatto-del-giorno.component';

/**
 * Pagina principale dove l'utente ha una breve introduzione al sito
 */
@Component({
	selector: 'app-home',
	templateUrl: 'home.page.html',
	styleUrls: ['home.page.scss'],
	imports: [IonContent, HeroComponent, PiattoDelGiornoComponent],
})
export class HomePage {
	constructor() {}
}
