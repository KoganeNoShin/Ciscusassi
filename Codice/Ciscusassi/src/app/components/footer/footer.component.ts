import { Component, OnInit } from '@angular/core';

import {
	IonFooter,
	IonToolbar,
	IonText,
	IonButtons,
} from '@ionic/angular/standalone';

/**
 * Componente personalizzato per mostrare in fondo alla pagina
 * i bottoni che riportano alle pagine linkedin dei creatori del sito
 */
@Component({
	selector: 'app-footer',
	templateUrl: './footer.component.html',
	styleUrls: ['./footer.component.scss'],
	standalone: true,
	imports: [IonButtons, IonText, IonFooter, IonToolbar],
})
export class FooterComponent implements OnInit {
	constructor() {}

	ngOnInit() {}
}
