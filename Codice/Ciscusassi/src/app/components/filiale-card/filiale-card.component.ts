import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import {
	IonButton,
	IonText,
	IonIcon,
	IonCard,
	IonImg,
} from '@ionic/angular/standalone';
import { FilialeRecord } from 'src/app/core/interfaces/Filiale';

import { addIcons } from 'ionicons';
import { location, time, informationCircle } from 'ionicons/icons';

@Component({
	selector: 'app-filiale-card',
	templateUrl: './filiale-card.component.html',
	styleUrls: ['./filiale-card.component.scss'],
	imports: [IonButton, IonText, IonIcon, IonCard, IonImg],
})
export class FilialeCardComponent implements OnInit {
	@Input() filiale!: FilialeRecord;
	@Output() selectFilialeEmitter: EventEmitter<number> = new EventEmitter();

	constructor() {
		addIcons({ location, time, informationCircle });
	}

	ngOnInit() {
		if (this.filiale == null) {
			throw 'Errore: la filiale passata al componente filiale card è nulla!';
		}
	}

	salvaFiliale(id_filiale: number) {
		this.selectFilialeEmitter.emit(id_filiale);
	}
}
