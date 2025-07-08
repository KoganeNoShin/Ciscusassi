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

/**
 * Card che permette di visualizzare i dettagli della propria
 * prenotazione ed eventualmente di gestirne la cancellazione.
 *
 * @param prenotazione - L'istanza della {@link PrenotazioneWithFiliale} che permette di visualizzarne i valori.
 * @returns `confermaCancellazioneEmitter` - Emitter che viene emesso quando il pulsante di cancellazione viene premuto.
 */
@Component({
	selector: 'app-prenotazione-card',
	templateUrl: './prenotazione-card.component.html',
	styleUrls: ['./prenotazione-card.component.scss'],
	imports: [IonCard, IonIcon, IonText, IonButton],
})
export class PrenotazioneCardComponent implements OnInit {
	@Input() prenotazione!: PrenotazioneWithFiliale;
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

	/**
	 * Funzione per passare ad una data scritta in formato italiano
	 * @param dateInput - la data in formato stringa
	 * @example
	 * Esempio di utilizzo
	 * ```
	 * formattaData("2025-07-06 00:00") -> "06/07/2025 - 00:00";
	 * ```
	 */
	formattaData(dateInput: string | number): string {
		// Normalizziamo la data siccome non è in formato ISO
		const safeInput =
			typeof dateInput === 'string'
				? dateInput.replace(' ', 'T')
				: dateInput;

		const date = new Date(safeInput);

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
