import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

import { ApiResponse } from '../interfaces/ApiResponse';
import { LoginRecord } from '../interfaces/Credentials';
import { BehaviorSubject, Observable } from 'rxjs';
import { Credentials } from '../interfaces/Credentials';

import { Storage } from '@ionic/storage-angular';

@Injectable({
	providedIn: 'root',
})
export class AuthenticationService {
	private apiURL = environment.apiURL;

	private roleSubject = new BehaviorSubject<string>('');
	role$ = this.roleSubject.asObservable(); // Il dollaro alla fine è convenzione per indicare un observable!

	private tokenSubject = new BehaviorSubject<string>('');
	token$ = this.tokenSubject.asObservable();

	constructor(
		private http: HttpClient,
		private storage: Storage
	) {}

	login(credentials: Credentials): Observable<ApiResponse<LoginRecord>> {
		return this.http.post<ApiResponse<LoginRecord>>(
			`${this.apiURL}/login`,
			credentials
		);
	}

	async setToken(token: string): Promise<void> {
		await this.storage.set('auth-token', token);
		this.tokenSubject.next(token);
	}

	async loadToken(): Promise<void> {
		const token = await this.storage.get('auth-token');
		this.tokenSubject.next(token ?? '');
		console.log(token);
	}

	getToken(): string {
		return this.tokenSubject.getValue();
	}

	async clearToken(): Promise<void> {
		await this.storage.remove('auth-token');
		this.tokenSubject.next('');
	}

	async setRole(role: string): Promise<void> {
		await this.storage.set('user-role', role);
		this.roleSubject.next(role);
	}

	async loadRole(): Promise<void> {
		const role = await this.storage.get('user-role');
		this.roleSubject.next(role ?? '');
		console.log(role);
	}

	getRole(): string {
		return this.roleSubject.getValue();
	}

	async clearRole(): Promise<void> {
		await this.storage.remove('user-role');
		this.roleSubject.next('');
	}

	async logout(): Promise<void> {
		await this.clearToken();
		await this.clearRole();
	}
}
