import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

import { ApiResponse } from '../interfaces/ApiResponse';
import { LoginRecord } from '../interfaces/Credentials';
import { BehaviorSubject, Observable } from 'rxjs';
import { Credentials } from '../interfaces/Credentials';

import { Storage } from '@ionic/storage-angular';

import { firstValueFrom } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class AuthenticationService {
	private apiURL = environment.apiURL;

	private tokenSubject = new BehaviorSubject<string>('');
	token$ = this.tokenSubject.asObservable(); // Il dollaro alla fine è convenzione per indicare un observable!

	private roleSubject = new BehaviorSubject<string>('');
	role$ = this.roleSubject.asObservable();

	private usernameSubject = new BehaviorSubject<string>('');
	username$ = this.usernameSubject.asObservable();

	private avatarSubject = new BehaviorSubject<string>('');
	avatar$ = this.avatarSubject.asObservable();

	private pointsSubject = new BehaviorSubject<number>(0);
	points$ = this.pointsSubject.asObservable();

	constructor(
		private http: HttpClient,
		private storage: Storage
	) {}

	// ----- Funzioni ------

	login(credentials: Credentials): Observable<ApiResponse<LoginRecord>> {
		return this.http.post<ApiResponse<LoginRecord>>(
			`${this.apiURL}/login`,
			credentials
		);
	}

	invalidateToken(): Observable<ApiResponse<string>> {
		return this.http.get<ApiResponse<string>>(`${this.apiURL}/logout`);
	}

	getPoints(): Observable<ApiResponse<number>> {
		return this.http.get<ApiResponse<number>>(`${this.apiURL}/points`, {
			headers: {
				Authorization: `Bearer ${this.getToken()}`,
			},
		});
	}

	async init(): Promise<void> {
		await Promise.all([
			this.loadToken(),
			this.loadUsername(),
			this.loadRole(),
			this.loadAvatar(),
		]);
	}

	async logout(): Promise<void> {
		try {
			const response = await firstValueFrom(this.invalidateToken());

			if (!response.success) {
				console.error(response.message || 'Errore sconosciuto');
			}

			await Promise.all([
				this.clearToken(),
				this.clearRole(),
				this.clearUsername(),
				this.clearAvatar(),
			]);
		} catch (err) {
			console.error('Errore durante il logout:', err);
			throw err;
		}
	}

	// ----- LOADERS ------

	async loadToken(): Promise<void> {
		const token = await this.storage.get('auth-token');
		this.tokenSubject.next(token ?? '');
		console.log(token);
	}

	async loadUsername(): Promise<void> {
		const username = await this.storage.get('auth-username');
		this.usernameSubject.next(username ?? '');
		console.log(username);
	}

	async loadRole(): Promise<void> {
		const role = await this.storage.get('auth-role');
		this.roleSubject.next(role ?? '');
		console.log(role);
	}

	async loadAvatar(): Promise<void> {
		const avatar = await this.storage.get('auth-avatar');
		this.avatarSubject.next(avatar ?? '');
		console.log(avatar);
	}

	// ----- SETTERS ------

	async setToken(token: string): Promise<void> {
		await this.storage.set('auth-token', token);
		this.tokenSubject.next(token);
	}

	async setUsername(username: string): Promise<void> {
		await this.storage.set('auth-username', username);
		this.usernameSubject.next(username);
	}

	async setRole(role: string): Promise<void> {
		await this.storage.set('auth-role', role);
		this.roleSubject.next(role);
	}

	async setAvatar(avatar: string): Promise<void> {
		await this.storage.set('auth-avatar', avatar);
		this.avatarSubject.next(avatar);
	}

	// ----- GETTERS ------

	getToken(): string {
		return this.tokenSubject.getValue();
	}

	getUsername(): string {
		return this.usernameSubject.getValue();
	}

	getRole(): string {
		return this.roleSubject.getValue();
	}

	getAvatar(): string {
		return this.avatarSubject.getValue();
	}

	// ----- CLEARERS ------

	async clearToken(): Promise<void> {
		await this.storage.remove('auth-token');
		this.tokenSubject.next('');
	}

	async clearUsername(): Promise<void> {
		await this.storage.remove('auth-username');
		this.usernameSubject.next('');
	}

	async clearRole(): Promise<void> {
		await this.storage.remove('auth-role');
		this.roleSubject.next('');
	}

	async clearAvatar(): Promise<void> {
		await this.storage.remove('auth-avatar');
		this.avatarSubject.next('');
	}
}
