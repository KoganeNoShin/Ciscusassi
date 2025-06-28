import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../interfaces/ApiResponse';
import { Observable } from 'rxjs';
import { ProdottoInput } from '../interfaces/Prodotto';

@Injectable({
	providedIn: 'root',
})
export class OrdineService {
	private apiURL = environment.apiURL;

	constructor(private http: HttpClient) {}

	addOrdine(
		ref_prenotazione: number,
		username: string,
		ref_cliente: number
	): Observable<ApiResponse<any>> {
		const body = {
			ref_prenotazione: ref_prenotazione,
			username: username,
			ref_cliente: ref_cliente,
		};

		return this.http.post<ApiResponse<any>>(
			`${this.apiURL}/addOrdine`,
			body,
			{ headers: { 'Content-Type': 'application/json' } }
		);
	}

	ordinePay(
		id_ordine: number,
		importo: number,
		data_ora_pagamento: string
	): Observable<ApiResponse<any>> {
		const body = {
			id_ordine: id_ordine,
			importo: importo,
			data_ora_pagamento: data_ora_pagamento,
		};

		return this.http.post<ApiResponse<any>>(
			`${this.apiURL}/ordine/pay`,
			body,
			{ headers: { 'Content-Type': 'application/json' } }
		);
	}

	ordineAddProdotti(
		ref_ordine: number,
		ref_prodotto: ProdottoInput[],
		stato_prodotto: string,
		Is_romana: number
	): Observable<ApiResponse<any>> {
		const body = {
			ref_ordine: ref_ordine,
			ref_prodotto: ref_prodotto,
			stato_prodotto: stato_prodotto,
			Is_romana: Is_romana,
		};

		return this.http.post<ApiResponse<any>>(
			`${this.apiURL}/ordine/addProdotti`,
			body,
			{ headers: { 'Content-Type': 'application/json' } }
		);
	}
}
