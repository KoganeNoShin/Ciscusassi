import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../interfaces/ApiResponse';
import { ProdottoRecord } from '../interfaces/Prodotto';

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
}
