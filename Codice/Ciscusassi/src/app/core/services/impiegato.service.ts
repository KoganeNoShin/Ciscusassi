import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../interfaces/ApiResponse';
import {
	ImpiegatoData,
	ImpiegatoInput,
	ImpiegatoRecord,
} from '../interfaces/Impiegato';

@Injectable({
	providedIn: 'root',
})
export class ImpiegatoService {
	private apiURL = environment.apiURL;

	constructor(private http: HttpClient) {}

	AddImpiegato(
		impiegato: ImpiegatoInput
	): Observable<ApiResponse<ImpiegatoRecord>> {
		return this.http.post<ApiResponse<ImpiegatoRecord>>(
			`${this.apiURL}/filiale/addImpiegato`,
			impiegato
		);
	}

	UpdateImpiegato(
		matricola: number,
		impiegato: ImpiegatoData
	): Observable<ApiResponse<ImpiegatoRecord>> {
		return this.http.put<ApiResponse<ImpiegatoRecord>>(
			`${this.apiURL}/filiale/updateImpiegato/${matricola}`,
			impiegato
		);
	}

	DeleteImpiegato(matricola: number): Observable<ApiResponse<void>> {
		return this.http.delete<ApiResponse<void>>(
			`${this.apiURL}/filiale/deleteImpiegato/${matricola}`
		);
	}

	GetImpiegati(
		filialeId: number
	): Observable<ApiResponse<ImpiegatoRecord[]>> {
		return this.http.get<ApiResponse<ImpiegatoRecord[]>>(
			`${this.apiURL}/filiale/${filialeId}/impiegati`
		);
	}
}
