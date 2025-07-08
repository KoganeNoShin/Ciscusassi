import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { IonButton, IonText } from '@ionic/angular/standalone';

/**
 * Componente utilizzato durante la fruizione dei menu che
 * permette di aprire le sezioni riguardanti le categorie dei piatti.
 *
 * @param title - Il titolo della sezione
 * @param backgroundURL - Lo sfondo della sezione
 * @returns `ApriMenuEmit` - Emitter che viene emesso al clic della sezione per visualizzarne il contenuto
 */
@Component({
	selector: 'app-menu-divider',
	templateUrl: './menu-divider.component.html',
	styleUrls: ['./menu-divider.component.scss'],
	standalone: true,
	imports: [IonText, IonButton],
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
