import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProdottoRecord } from 'src/app/core/interfaces/Prodotto';
import { TavoloService } from 'src/app/core/services/tavolo.service';
import { PrenotazioneService } from 'src/app/core/services/prenotazione.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
	selector: 'app-ricevuta',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './ricevuta.component.html',
	styleUrls: ['./ricevuta.component.scss'],
})
export class RicevutaComponent {
	@Input() carrello: ProdottoRecord[] = [];
	@Input() logo!: string;
	@Input() servizio: string = '';
	numeroOrdine: number | null = null;
  totaleQuery: number = 0;

	data: string = new Date().toLocaleString();

	constructor(
		private tavoloService: TavoloService,
		private prenotazioneService: PrenotazioneService
	) {
		this.numeroOrdine = this.tavoloService.getNumeroOrdine();
	}

	get prodottiRaggruppati() {
		const raggruppati: {
			[nome: string]: { prodotto: ProdottoRecord; quantita: number };
		} = {};
		for (const p of this.carrello) {
			if (raggruppati[p.nome]) {
				raggruppati[p.nome].quantita += 1;
			} else {
				raggruppati[p.nome] = { prodotto: p, quantita: 1 };
			}
		}
		return Object.values(raggruppati);
	}

	get totale(): number {
		return Number(
			this.prodottiRaggruppati
				.reduce(
					(acc, item) => acc + item.quantita * item.prodotto.costo,
					0
				)
				.toFixed(2)
		);
	}

  ngOnInit(){
    this.totaleQuery = this.tavoloService.getTotaleQuery();
  }

	get differenzaTotale(): number {
		return Number((this.totale - this.totaleQuery).toFixed(2));
	}
}
