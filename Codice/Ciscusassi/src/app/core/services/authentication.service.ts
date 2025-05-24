import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

import { ApiResponse } from '../interfaces/ApiResponse';
import { LoginRecord } from '../interfaces/Credentials';
import { Observable } from 'rxjs';
import { Credentials } from '../interfaces/Credentials';

@Injectable({
	providedIn: 'root',
})
export class AuthenticationService {
	private apiURL = environment.apiURL;

	constructor(private http: HttpClient) {}

	isAuthenticated() {
		return true;
	}

	login(credentials: Credentials): Observable<ApiResponse<LoginRecord>> {
		return this.http.post<ApiResponse<LoginRecord>>(
			`${this.apiURL}/login`,
			credentials
		);
	}
}
