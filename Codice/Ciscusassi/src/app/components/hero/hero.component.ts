import { Component, OnInit, Input } from '@angular/core';

import { IonIcon, IonText } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { chevronDown } from 'ionicons/icons';

import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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

	safeTitle: SafeHtml = '';
	safeDescription: SafeHtml = '';

	constructor(private sanitizer: DomSanitizer) {
		addIcons({ chevronDown });
		this.safeTitle = this.sanitizer.bypassSecurityTrustHtml(this.title);
		this.safeDescription = this.sanitizer.bypassSecurityTrustHtml(
			this.description
		);
	}

	ngOnInit() {
		this.safeTitle = this.sanitizer.bypassSecurityTrustHtml(this.title);
		this.safeDescription = this.sanitizer.bypassSecurityTrustHtml(
			this.description
		);
	}
}
