import { Component, OnInit, Input } from '@angular/core';

import { IonIcon, IonText } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { chevronDown } from 'ionicons/icons';

@Component({
	selector: 'app-hero',
	templateUrl: './hero.component.html',
	styleUrls: ['./hero.component.scss'],
	standalone: true,
	imports: [IonText, IonIcon],
})
export class HeroComponent implements OnInit {
	@Input() title: string = '';
	@Input() description: string = '';
	@Input() backgroundURL: string = '';

	constructor() {
		addIcons({ chevronDown });
	}

	ngOnInit() {}
}
