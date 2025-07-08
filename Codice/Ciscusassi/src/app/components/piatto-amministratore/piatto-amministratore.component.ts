import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {
	IonCard,
	IonCardTitle,
	IonCardHeader,
	IonCardContent,
	IonButton,
	IonText,
	IonIcon,
	IonImg,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { star, starOutline } from 'ionicons/icons';
import { ProdottoRecord } from 'src/app/core/interfaces/Prodotto';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

/**
 * Componente che permette di visualizzare ed accedere
 * ai controlli da amministratore per ogni piatto.
 *
 * @param prodotto L'oggetto {@link ProdottoRecord} che serve per visualizzarne i valori all'interno della card
 * @param idPiattoDelGiorno L'id del piatto del giorno correntemente selezionato
 *
 * @returns `changePiattoDelGiornoEmitter` Emitter che viene emesso al cambio del piatto del giorno (click sulla stella)
 * @returns `showAlertDeletePiattoEmitter` Emitter che viene emesso alla pressione del tasto di cancellazione piatto
 */
@Component({
	selector: 'app-piatto-amministratore',
	templateUrl: './piatto-amministratore.component.html',
	styleUrls: ['./piatto-amministratore.component.scss'],
	imports: [
		IonCard,
		IonCardTitle,
		IonCardHeader,
		IonCardContent,
		IonButton,
		IonIcon,
		IonImg,
		RouterModule,
		IonText,
		CommonModule,
	],
})
export class PiattoAmministratoreComponent implements OnInit {
	@Input() prodotto!: ProdottoRecord;
	@Input() idPiattoDelGiorno: number | null = null;
	@Output() changePiattoDelGiornoEmitter: EventEmitter<ProdottoRecord> =
		new EventEmitter();
	@Output() showAlertDeletePiattoEmitter: EventEmitter<ProdottoRecord> =
		new EventEmitter();

	constructor() {
		addIcons({ star, starOutline });
	}

	ngOnInit() {
		if (this.prodotto == null) {
			console.error(
				'Il prodotto nel componente piatto-amministratore è nullo!'
			);
		}
	}

	changePiattoDelGiorno() {
		this.changePiattoDelGiornoEmitter.emit(this.prodotto);
	}

	showAlertDeletePiatto() {
		this.showAlertDeletePiattoEmitter.emit(this.prodotto);
	}
}
