import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../interfaces/ApiResponse';
import {
	PrenotazioneInput,
	PrenotazioneRecord,
	PrenotazioneRequest,
} from '../interfaces/Prenotazione';

@Injectable({
	providedIn: 'root',
})
export class PrenotazioneService {
	private apiURL = environment.apiURL;

	// Dati locali temporanei
	private filialeId: number = 0;
	private numeroPosti: number = 0;
	private dataPrenotazione: string = '';
	private oraPrenotazione: string = '';

	constructor(private http: HttpClient) {}

	// --------- Metodi HTTP ---------

	getAllPrenotazioni(): Observable<ApiResponse<PrenotazioneRecord[]>> {
		return this.http.get<ApiResponse<PrenotazioneRecord[]>>(
			`${this.apiURL}/prenotazioni`
		);
	}

	getPrenotazioneById(
		id: number
	): Observable<ApiResponse<PrenotazioneRecord>> {
		return this.http.get<ApiResponse<PrenotazioneRecord>>(
			`${this.apiURL}/prenotazione/${id}`
		);
	}

	getPrenotazioniByCliente(
		clienteId: number
	): Observable<ApiResponse<PrenotazioneRecord[]>> {
		return this.http.get<ApiResponse<PrenotazioneRecord[]>>(
			`${this.apiURL}/prenotazioni/cliente/${clienteId}`
		);
	}

	getPrenotazioniDelGiornoFiliale(filialeId: number): Observable<ApiResponse<PrenotazioneRecord[]>> {
		return this.http.get<ApiResponse<PrenotazioneRecord[]>>(`${this.apiURL}/prenotazioni/oggi/${filialeId}`);
	}

	getStatoPrenotazione(id: number) {
		return this.http.get<{ success: boolean, data: string }>(`${this.apiURL}/prenotazioni/${id}/stato`);
	}

	getTavoliInUso(): Observable<any> {
		return this.http.get(`${this.apiURL}/tavoli-in-uso`);
	}

	prenota(data: PrenotazioneRequest): Observable<ApiResponse<any>> {
		return this.http.post<ApiResponse<any>>(`${this.apiURL}/prenota`, data);
	}

	prenotaLoco(data: PrenotazioneInput): Observable<ApiResponse<any>> {
		return this.http.post<ApiResponse<any>>(
			`${this.apiURL}/prenotaLoco`,
			data
		);
	}

	modificaPrenotazione(
		data: PrenotazioneRecord
	): Observable<ApiResponse<any>> {
		return this.http.put<ApiResponse<any>>(
			`${this.apiURL}/modificaPrenotazione`,
			data
		);
	}

	eliminaPrenotazione(id: number): Observable<ApiResponse<any>> {
		return this.http.delete<ApiResponse<any>>(
			`${this.apiURL}/eliminaPrenotazione/${id}`
		);
	}

	// --------- Get/Set locali ---------

	setFilialeId(id: number): void {
		this.filialeId = id;
	}

	setNumeroPosti(numero: number): void {
		this.numeroPosti = numero;
	}

	setDataPrenotazione(data: string): void {
		this.dataPrenotazione = data;
	}

	setOraPrenotazione(ora: string): void {
		this.oraPrenotazione = ora;
	}

	getFilialeId(): number {
		return this.filialeId;
	}

	getNumeroPosti(): number {
		return this.numeroPosti;
	}

	getDataPrenotazione(): string {
		return this.dataPrenotazione;
	}

	getOraPrenotazione(): string {
		return this.oraPrenotazione;
	}
}
