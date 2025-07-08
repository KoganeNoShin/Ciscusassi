import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IonText } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

/**
 * Pulsante che permette all'utente di scegliere il numero di persone
 * che saranno presenti durante la sua prenotazione.
 *
 * @param number - Il numero di persone che l'istanza del componente rappresenta.
 * @param personeSelezionate - Il numero di persone che sono state selezionate dall'utente.
 * @param inputManuale - Il numero di persone che sono state selezioante dall'utente tramite il campo del form nella pagina di prenotazione.
 * @returns `selectCircleEmitter` - Emitter che viene emesso quando uno dei bottoni viene premuto.
 */
@Component({
	selector: 'app-numero-posti-button',
	templateUrl: './numero-posti-button.component.html',
	styleUrls: ['./numero-posti-button.component.scss'],
	imports: [IonText, CommonModule],
})
export class NumeroPostiButton implements OnInit {
	@Input() number: number = 0;
	@Input() personeSelezionate?: number | null = null;
	@Input() inputManuale?: number | null = null;
	@Output() selectCircleEmitter: EventEmitter<number> = new EventEmitter();

	constructor() {}

	ngOnInit() {
		if (this.number == 0) {
			throw 'Errore: il numero di tavoli nel componente non può essere 0!';
		}
	}

	selectedCircle() {
		this.selectCircleEmitter.emit(this.number);
	}
}
