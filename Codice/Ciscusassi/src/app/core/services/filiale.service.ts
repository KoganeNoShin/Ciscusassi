import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../interfaces/ApiResponse';
import { FilialeInput, FilialeRecord } from '../interfaces/Filiale';

@Injectable({
	providedIn: 'root',
})
export class FilialeService {
	private apiURL = environment.apiURL;

	constructor(private http: HttpClient) {}

	GetSedi(): Observable<ApiResponse<FilialeRecord[]>> {
		return this.http.get<ApiResponse<FilialeRecord[]>>(
			`${this.apiURL}/filiali`
		);
	}

	addFiliale(filiale: FilialeInput): Observable<ApiResponse<number>> {
		return this.http.post<ApiResponse<number>>(
			`${this.apiURL}/filiali/addFiliale`,
			filiale
		);
	}

	updateFiliale(
		id: number,
		filiale: FilialeInput
	): Observable<ApiResponse<void>> {
		return this.http.put<ApiResponse<void>>(
			`${this.apiURL}/filiali/updateFiliale/${id}`,
			filiale
		);
	}

	deleteFiliale(id: number): Observable<ApiResponse<void>> {
		return this.http.delete<ApiResponse<void>>(
			`${this.apiURL}/filiali/deleteFiliale/${id}`
		);
	}
}
