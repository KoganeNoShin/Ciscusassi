import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../interfaces/ApiResponse';
import { ProdottoInput, ProdottoRecord } from '../interfaces/Prodotto';

@Injectable({
	providedIn: 'root',
})
export class ProdottoService {
	private apiURL = environment.apiURL;

	constructor(private http: HttpClient) {}

	GetProdotti(): Observable<ApiResponse<ProdottoRecord[]>> {
		return this.http.get<ApiResponse<ProdottoRecord[]>>(
			`${this.apiURL}/Prodotti`
		);
	}

	GetPiattoDelGiorno(): Observable<ApiResponse<ProdottoRecord>> {
		return this.http.get<ApiResponse<ProdottoRecord>>(
			`${this.apiURL}/PiattoDelGiorno`
		);
	}

	chargePiattoDelGiorno(id: number): Observable<ApiResponse<ProdottoRecord>> {
		return this.http.put<ApiResponse<ProdottoRecord>>(
			`${this.apiURL}/chargePiattoDelGiorno/${id}`,
			{}
		);
	}

	addProdotto(prodotto: ProdottoInput): Observable<ApiResponse<number>> {
		return this.http.post<ApiResponse<number>>(
			`${this.apiURL}/addProdotto`,
			prodotto
		);
	}
	
	updateProdotto(id: number, prodotto: ProdottoInput): Observable<ApiResponse<void>> {
		return this.http.put<ApiResponse<void>>(
			`${this.apiURL}/updateProdotto/${id}`,
			prodotto
		);
	}

	deleteProdotto(id: number): Observable<ApiResponse<void>> {
		return this.http.delete<ApiResponse<void>>(
			`${this.apiURL}/deleteProdotto/${id}`
		);
	}
}
