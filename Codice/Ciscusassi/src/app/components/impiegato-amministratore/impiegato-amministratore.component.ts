import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

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

	constructor(
		private route: ActivatedRoute, // Per leggere parametri query string da URL
		private router: Router // Per gestione navigazione e stato
	) {}

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
