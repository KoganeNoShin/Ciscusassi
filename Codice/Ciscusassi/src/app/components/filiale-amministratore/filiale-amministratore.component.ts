import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {
	IonCard,
	IonCardTitle,
	IonCardHeader,
	IonCardContent,
	IonButton,
	IonText,
	IonImg,
} from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { FilialeRecord } from 'src/app/core/interfaces/Filiale';

@Component({
	selector: 'app-filiale-amministratore',
	templateUrl: './filiale-amministratore.component.html',
	styleUrls: ['./filiale-amministratore.component.scss'],
	imports: [
		IonCard,
		IonCardTitle,
		IonCardHeader,
		IonCardContent,
		IonButton,
		IonImg,
		RouterModule,
		IonText,
	],
})
export class FilialeAmministratoreComponent implements OnInit {
	@Input() filiale!: FilialeRecord;
	@Output() showAlertDeleteFilialeEmitter: EventEmitter<FilialeRecord> =
		new EventEmitter();

	constructor() {}

	ngOnInit() {
		if (this.filiale == null) {
			console.error(
				'La filiale nel componente filiale-amministratore è nulla!'
			);
		}
	}

	showAlertDeleteFiliale() {
		this.showAlertDeleteFilialeEmitter.emit(this.filiale);
	}
}
