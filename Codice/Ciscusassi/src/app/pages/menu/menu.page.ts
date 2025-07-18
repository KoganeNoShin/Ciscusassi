import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent } from '@ionic/angular/standalone';
import { HeroComponent } from 'src/app/components/hero/hero.component';

import { PiattoDelGiornoComponent } from '../../components/piatto-del-giorno/piatto-del-giorno.component';
import { ListaMenuComponent } from '../../components/lista-menu/lista-menu.component';

/**
 * Pagina dove l'utente può visualizzare il menu senza però effettuare ordini,
 * quindi esclusivamente per conoscere i piatti della catena di ristoranti
 */
@Component({
	selector: 'app-menu',
	templateUrl: './menu.page.html',
	styleUrls: ['./menu.page.scss'],
	standalone: true,
	imports: [
		IonContent,
		CommonModule,
		HeroComponent,
		PiattoDelGiornoComponent,
		ListaMenuComponent,
	],
})
export class MenuPage implements OnInit {
	constructor() {}

	ngOnInit() {}
}
