import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { IonButton } from '@ionic/angular/standalone';

@Component({
	selector: 'app-menu-divider',
	templateUrl: './menu-divider.component.html',
	styleUrls: ['./menu-divider.component.scss'],
	standalone: true,
	imports: [IonButton],
})
export class MenuDividerComponent implements OnInit {
	@Input() title: string = '';
	@Input() backgroundURL: string = '';

	@Output() ApriMenuEmit = new EventEmitter<void>();

	constructor() {}

	ngOnInit() {}

	ApriMenu() {
		this.ApriMenuEmit.emit();
	}
}
