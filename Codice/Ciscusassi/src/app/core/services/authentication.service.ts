import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

import { ApiResponse } from '../interfaces/ApiResponse';
import { LoginRecord, OurTokenPayload, RegistrationData } from '../interfaces/Credentials';
import { BehaviorSubject, Observable } from 'rxjs';
import { Credentials } from '../interfaces/Credentials';

import { Storage } from '@ionic/storage-angular';

import { firstValueFrom } from 'rxjs';

import { jwtDecode } from 'jwt-decode';

@Injectable({
	providedIn: 'root',
})
export class AuthenticationService {
	private apiURL = environment.apiURL;

	private idUtenteSubject = new BehaviorSubject<number>(-1);
	id_utente$ = this.idUtenteSubject.asObservable(); // Il dollaro alla fine è convenzione per indicare un observable!

	private tokenSubject = new BehaviorSubject<string>('');
	token$ = this.tokenSubject.asObservable();

	private roleSubject = new BehaviorSubject<string>('');
	role$ = this.roleSubject.asObservable();

	private usernameSubject = new BehaviorSubject<string>('');
	username$ = this.usernameSubject.asObservable();

	private avatarSubject = new BehaviorSubject<string>('');
	avatar$ = this.avatarSubject.asObservable();

	private filialeSubject = new BehaviorSubject<number>(-1);
	filiale$ = this.filialeSubject.asObservable();

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

	registrati(credentials: RegistrationData): Observable<ApiResponse<any>> {
		return this.http.post<ApiResponse<any>>(
			`${this.apiURL}/register`,
			credentials
		);
	}

	decodeTokenPayload(token: string): OurTokenPayload {
		try {
			const decoded = jwtDecode<OurTokenPayload>(token);

			return decoded;
		} catch (err) {
			throw new Error('Token non valido o scaduto!');
		}
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
			this.loadIdUtente(),
			this.loadToken(),
			this.loadUsername(),
			this.loadRole(),
			this.loadAvatar(),
			this.loadFiliale(),
		]);
	}

	async logout(): Promise<void> {
		try {
			const response = await firstValueFrom(this.invalidateToken());

			if (!response.success) {
				console.error(response.message || 'Errore sconosciuto');
			}

			await Promise.all([
				this.clearIdUtente(),
				this.clearToken(),
				this.clearRole(),
				this.clearUsername(),
				this.clearAvatar(),
				this.clearFiliale(),
			]);
		} catch (err) {
			console.error('Errore durante il logout:', err);
			throw err;
		}
	}

	// ----- LOADERS ------

	async loadIdUtente(): Promise<void> {
		const id_utente = await this.storage.get('auth-id-utente');
		this.idUtenteSubject.next(id_utente ?? -1);
		console.log(id_utente);
	}

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

	async loadFiliale(): Promise<void> {
		const filiale = await this.storage.get('auth-filiale');
		this.filialeSubject.next(filiale ?? -1);
		console.log(filiale);
	}

	// ----- SETTERS ------

	async setIdUtente(id_utente: number): Promise<void> {
		await this.storage.set('auth-id-utente', id_utente);
		this.idUtenteSubject.next(id_utente);
	}

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

	async setFiliale(filiale: number | undefined): Promise<void> {
		if (filiale != undefined) {
			await this.storage.set('auth-filiale', filiale);
			this.filialeSubject.next(filiale);
		}
	}

	// ----- GETTERS ------

	getIdUtente(): number {
		return this.idUtenteSubject.getValue();
	}

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

	getFiliale(): number {
		return this.filialeSubject.getValue();
	}

	// ----- CLEARERS ------

	async clearIdUtente(): Promise<void> {
		await this.storage.remove('auth-id-utente');
		this.idUtenteSubject.next(-1);
	}

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

	async clearFiliale(): Promise<void> {
		await this.storage.remove('auth-filiale');
		this.filialeSubject.next(-1);
	}
}
