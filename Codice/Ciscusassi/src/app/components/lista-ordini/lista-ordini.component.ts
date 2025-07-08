import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProdottoOrdineComponent } from '../prodotto-ordine/prodotto-ordine.component';
import { OrdProdEstended } from 'src/app/core/interfaces/OrdProd';
import { Observable } from 'rxjs';

/**
 * Semplice componente lista utilizzato dal cliente, dal cameriere e dallo chef durante la visualizzazione degli ordini.
 *
 * @param prodotti - Observable sui vari prodotti che sono stati ordinati
 */
@Component({
	selector: 'app-lista-ordini',
	templateUrl: './lista-ordini.component.html',
	styleUrls: ['./lista-ordini.component.scss'],
	standalone: true,
	imports: [CommonModule, ProdottoOrdineComponent],
})
export class ListaOrdiniComponent implements OnInit {
	@Input() prodotti$!: Observable<OrdProdEstended[]>;

	constructor() {}

	ngOnInit() {}
}
