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

/**
 * Componente che permette di visualizzare ed accedere
 * ai controlli da amministratore per ogni filiale.
 *
 * @param filiale L'oggetto {@link FilialeRecord} che serve per visualizzarne i valori all'interno della card
 *
 * @returns `showAlertDeleteFilialeEmitter` Emitter che viene emesso alla pressione del tasto di cancellazione filiale
 */
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
