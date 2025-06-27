import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'app-numero-posti-button',
	templateUrl: './numero-posti-button.component.html',
	styleUrls: ['./numero-posti-button.component.scss'],
})
export class NumeroPostiButton implements OnInit {
	@Input() number: number = 0;
	@Input() personeSelezionate?: number | null = null;
	@Input() inputManuale?: number | null = null;
	@Output() selectCircleEmitter: EventEmitter<number> = new EventEmitter();

	constructor() {}

	ngOnInit() {
		if (this.number == 0) {
			throw 'Errore: il numero di tavoli non può essere 0 nel componente!';
		}
	}

	selectedCircle() {
		this.selectCircleEmitter.emit(this.number);
	}
}
