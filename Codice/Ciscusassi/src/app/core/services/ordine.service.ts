import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../interfaces/ApiResponse';
import { Observable } from 'rxjs';
import { ProdottoInput } from '../interfaces/Prodotto';
import { OrdProdEstended, OrdProdInput } from '../interfaces/OrdProd';

@Injectable({
	providedIn: 'root',
})
export class OrdineService {
	private apiURL = environment.apiURL;
	prodottiOrdinati: OrdProdEstended[] = [];

	constructor(private http: HttpClient) {}

	addOrdine(
		username: string,
		ref_prenotazione: number,
		ref_cliente: number | null
	): Observable<ApiResponse<any>> {
		const body = {
			username_ordinante: username,
			ref_prenotazione: ref_prenotazione,
			ref_cliente: ref_cliente,
		};

		return this.http.post<ApiResponse<any>>(
			`${this.apiURL}/prenotazione/addOrdine`,
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
			`${this.apiURL}/prenotazione/ordine/pay`,
			body,
			{ headers: { 'Content-Type': 'application/json' } }
		);
	}

	ordineAddProdotti(
		ref_prodotto: OrdProdInput[]
	): Observable<ApiResponse<any>> {
		const body = ref_prodotto;

		return this.http.post<ApiResponse<any>>(
			`${this.apiURL}/prenotazione/ordine/addProdotti`,
			body,
			{ headers: { 'Content-Type': 'application/json' } }
		);
	}

	getProdottiOrdinatiByNumeroOrdine(
		id: number
	): Observable<ApiResponse<OrdProdEstended>> {
		return this.http.get<ApiResponse<OrdProdEstended>>(
			`${this.apiURL}/prenotazione/ordine/${id}/prodotti`
		);
	}

	getProdottiOrdinatiByUsername(
		idPrenotazione: number,
		username: string
	): Observable<ApiResponse<any>> {
		return this.http.get<ApiResponse<any>>(
			`${this.apiURL}/prenotazione/${idPrenotazione}/ordini/${username}`
		);
	}

	setProdottiOrdinati(prodottiOrdinati: OrdProdEstended[]) {
		this.prodottiOrdinati = prodottiOrdinati;
	}

	getProdottiOrdinati(): OrdProdEstended[] {
		return this.prodottiOrdinati;
	}
}
