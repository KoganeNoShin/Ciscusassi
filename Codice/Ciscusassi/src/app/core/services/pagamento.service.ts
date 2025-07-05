import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../interfaces/ApiResponse';
import { PagamentoMensile } from '../interfaces/Pagamento';

@Injectable({
	providedIn: 'root',
})
export class PagamentoService {
	/**
	 * @remarks
	 * Recuperiamo {@link environment.apiURL l'URL dell'API} dal file di ambiente {@link environment} 
	 * per effettuare le richieste HTTP
	 */
	private apiURL = environment.apiURL;

	constructor(private http: HttpClient) {}

	/**
	 * @remarks
	 * La seguente funzione è utilizzata per effettuare una richiesta GET
	 * all'API per ottenere gli utili mensili. Viene passato un oggetto {@link PagamentoMensile}
	 * La rotta dell'API utilizzata è la `/pagamenti`, definita nel file routes.ts.
	 * @returns
	 * Un Observable di tipo ApiResponse che contiene un array di oggetti {@link PagamentoMensile}.
	 */
	GetUtiliMensili(year: number): Observable<ApiResponse<PagamentoMensile[]>> {
		return this.http.get<ApiResponse<PagamentoMensile[]>>(
			`${this.apiURL}/pagamenti/${year}`
		);
	}

	/**
	 * @remarks
	 * La seguente funzione è utilizzata per effettuare una richiesta POST
	 * all'API per registrare un pagamento di un ordine. Viene passato l'id dell'ordine,
	 * l'importo del pagamento e la data/ora del pagamento.
	 * La rotta dell'API utilizzata è la `/prenotazione/ordine/pay`, definita nel file routes.ts.
	 * @returns
	 * Un Observable di tipo ApiResponse void.
	 */
	ordinePay(
		id_ordine: number,
		importo: number,
		data_ora_pagamento: string
	): Observable<ApiResponse<any>> {
		const body = {
			id_ordine: id_ordine,
			pagamento_importo: importo,
			data_ora_pagamento: data_ora_pagamento,
		};

		return this.http.post<ApiResponse<any>>(
			`${this.apiURL}/prenotazione/ordine/pay`,
			body,
			{ headers: { 'Content-Type': 'application/json' } }
		);
	}
}
