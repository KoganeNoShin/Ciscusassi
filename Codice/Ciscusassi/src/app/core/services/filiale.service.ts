import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../interfaces/ApiResponse';
import { FilialeRecord } from '../interfaces/Filiale';

@Injectable({
	providedIn: 'root',
})
export class FilialeService {
	private apiURL = environment.apiURL;

	constructor(private http: HttpClient) {}

	GetSedi(): Observable<ApiResponse<FilialeRecord[]>> {
		return this.http.get<ApiResponse<FilialeRecord[]>>(
			`${this.apiURL}/Filiali`
		);
	}
}
