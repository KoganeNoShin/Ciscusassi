import { Component, OnInit } from '@angular/core';

import {
	IonFooter,
	IonToolbar,
	IonText,
	IonButtons,
} from '@ionic/angular/standalone';

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
