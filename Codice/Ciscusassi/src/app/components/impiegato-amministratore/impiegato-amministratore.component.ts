import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ImpiegatoRecord } from 'src/app/core/interfaces/Impiegato';

import {
	IonButton,
	IonCard,
	IonCardContent,
	IonCardHeader,
	IonCardTitle,
	IonImg,
	IonText,
} from '@ionic/angular/standalone';

/**
 * Componente che permette di visualizzare ed accedere
 * ai controlli da amministratore per ogni impiegato.
 *
 * @param impiegato L'oggetto {@link ImpiegatoRecord} che serve per visualizzarne i valori all'interno della card
 *
 * @returns `showAlertDeleteImpiegatoEmitter` Emitter che viene emesso alla pressione del tasto di licenziamento
 */
@Component({
	selector: 'app-impiegato-amministratore',
	templateUrl: './impiegato-amministratore.component.html',
	styleUrls: ['./impiegato-amministratore.component.scss'],
	imports: [
		IonCard,
		IonCardHeader,
		IonCardTitle,
		IonCardContent,
		IonButton,
		IonImg,
		RouterLink,
		IonText,
	],
})
export class ImpiegatoAmministratoreComponent implements OnInit {
	@Input() impiegato!: ImpiegatoRecord;
	@Output() showAlertDeleteImpiegatoEmitter: EventEmitter<ImpiegatoRecord> =
		new EventEmitter();

	constructor() {}

	ngOnInit() {
		if (this.impiegato == null) {
			console.error(
				'La filiale nel componente filiale-amministratore è nulla!'
			);
		}
	}

	showAlertDeleteDipendente() {
		this.showAlertDeleteImpiegatoEmitter.emit(this.impiegato);
	}
}
