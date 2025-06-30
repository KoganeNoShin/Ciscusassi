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
	],
})
export class PiattoAmministratoreComponent implements OnInit {
	@Input() prodotto!: ProdottoRecord;
	@Input() idPiattoDelGiorno: number = -1;
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
