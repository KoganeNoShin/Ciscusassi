import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../interfaces/ApiResponse';
import { AsportoInput, AsportoRecord } from '../interfaces/Asporto';

@Injectable({
	providedIn: 'root',
})
export class AsportoService {
	private apiURL = environment.apiURL;

	constructor(private http: HttpClient) {}

	GetProdotti(): Observable<ApiResponse<AsportoRecord[]>> {
		return this.http.get<ApiResponse<AsportoRecord[]>>(
			`${this.apiURL}/asporti`
		);
	}

	addProdotto(prodotto: AsportoInput): Observable<ApiResponse<number>> {
		return this.http.post<ApiResponse<number>>(
			`${this.apiURL}/addAsporto`,
			prodotto
		);
	}

	updateProdotto(
		id: number,
		prodotto: AsportoInput
	): Observable<ApiResponse<void>> {
		return this.http.put<ApiResponse<void>>(
			`${this.apiURL}/updateAsporto/${id}`,
			prodotto
		);
	}

	deleteProdotto(id: number): Observable<ApiResponse<void>> {
		return this.http.delete<ApiResponse<void>>(
			`${this.apiURL}/deleteAsporto/${id}`
		);
	}
}
