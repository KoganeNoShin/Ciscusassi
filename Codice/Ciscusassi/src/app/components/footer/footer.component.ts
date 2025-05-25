import { Component, OnInit } from '@angular/core';

import { IonFooter, IonToolbar } from '@ionic/angular/standalone';

@Component({
	selector: 'app-footer',
	templateUrl: './footer.component.html',
	styleUrls: ['./footer.component.scss'],
	standalone: true,
	imports: [IonFooter, IonToolbar],
})
export class FooterComponent implements OnInit {
	constructor() {}

	ngOnInit() {}
}
