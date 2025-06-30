import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import {
	IonCard,
	IonIcon,
	IonText,
	IonButton,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { location, calendar, person, people } from 'ionicons/icons';

import { PrenotazioneWithFiliale } from 'src/app/core/interfaces/Prenotazione';

@Component({
	selector: 'app-prenotazione-card',
	templateUrl: './prenotazione-card.component.html',
	styleUrls: ['./prenotazione-card.component.scss'],
	imports: [IonCard, IonIcon, IonText, IonButton],
})
export class PrenotazioneCardComponent implements OnInit {
	@Input() prenotazione!: PrenotazioneWithFiliale; // La variabile che riceverai
	@Output() confermaCancellazioneEmitter: EventEmitter<number> =
		new EventEmitter();

	constructor() {
		addIcons({ location, calendar, person, people });
	}

	ngOnInit() {
		// Controlliamo che la prenotazione non sia null
		if (!this.prenotazione) {
			throw new Error('Prenotazione non passata al componente');
		}
	}

	formattaData(dateInput: string | number): string {
		const date = new Date(dateInput);
		if (isNaN(date.getTime())) {
			console.error('Data non valida:', dateInput);
			return '';
		}

		const pad = (n: number) => n.toString().padStart(2, '0');

		return `${pad(date.getDate())}/${pad(
			date.getMonth() + 1
		)}/${pad(date.getFullYear())} - ${pad(date.getHours())}:${pad(
			date.getMinutes()
		)}`;
	}

	confermaCancellazione() {
		this.confermaCancellazioneEmitter.emit(
			this.prenotazione.id_prenotazione
		);
	}
}
