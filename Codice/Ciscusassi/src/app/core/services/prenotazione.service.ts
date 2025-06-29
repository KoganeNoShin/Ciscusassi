import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../interfaces/ApiResponse';
import {
	PrenotazioneInput,
	PrenotazioneRecord,
	PrenotazioneRequest,
	PrenotazioneWithFiliale,
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
	private numeroTavoli: number = 0;

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

	checkOtp(
		data_ora_prenotazione: string,
		ref_torretta: number,
		otp: string
	): Observable<ApiResponse<any>> {
		const body = {
			data_ora_prenotazione: data_ora_prenotazione,
			ref_torretta: ref_torretta,
			otp: otp,
		};

		return this.http.post<ApiResponse<any>>(
			`${this.apiURL}/prenotazione/check-otp`,
			body,
			{ headers: { 'Content-Type': 'application/json' } }
		);
	}

	getPrenotazioniByCliente(
		clienteId: number
	): Observable<ApiResponse<PrenotazioneWithFiliale[]>> {
		return this.http.get<ApiResponse<PrenotazioneWithFiliale[]>>(
			`${this.apiURL}/prenotazioni/cliente/${clienteId}`
		);
	}

	getPrenotazioniDelGiornoFiliale(
		filialeId: number
	): Observable<ApiResponse<PrenotazioneRecord[]>> {
		return this.http.get<ApiResponse<PrenotazioneRecord[]>>(
			`${this.apiURL}/filiale/${filialeId}/prenotazioni`
		);
	}

	getStatoPrenotazioneCameriere(id: number) {
		return this.http.get<{ success: boolean; data: string }>(
			`${this.apiURL}/prenotazione/${id}/cameriere/stato`
		);
	}

	getStatoPrenotazioneChef(id: number) {
		return this.http.get<{ success: boolean; data: string }>(
			`${this.apiURL}/prenotazione/${id}/chef/stato`
		);
	}


	getTavoliInUso(): Observable<any> {
		return this.http.get(`${this.apiURL}/tavoli-in-uso`);
	}

	prenota(data: PrenotazioneRequest): Observable<ApiResponse<any>> {
		return this.http.post<ApiResponse<any>>(`${this.apiURL}/prenota`, data);
	}

	prenotaLoco(data: PrenotazioneRequest): Observable<ApiResponse<any>> {
		return this.http.post<ApiResponse<any>>(
			`${this.apiURL}/prenotaLoco`,
			data
		);
	}

	confermaPrenotazione(id: number): Observable<ApiResponse<any>> {
		return this.http.post<ApiResponse<any>>(
			`${this.apiURL}/prenotazione/conferma`,
			{ id_prenotazione: id }
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
	tavoliInUso(
		id_filiale: number,
		data: string
	): Observable<ApiResponse<any>> {
		return this.http
			.get<{
				[fascia: string]: number;
			}>(`${this.apiURL}/filiale/${id_filiale}/tavoli-in-uso?data=${data}`)
			.pipe(
				// Wrap the response in an ApiResponse object
				map((data) => ({
					success: true,
					data,
				}))
			);
	}

	// --------- Get/Set locali ---------

	setFilialeId(id: number): void {
		this.filialeId = id;
	}

	setNumeroPosti(numero: number): void {
		this.numeroPosti = numero;

		for (let t = 2; t <= this.numeroPosti; t++) {
			const postiDisponibili = 2 * t + 2;
			if (postiDisponibili >= this.numeroPosti) {
				this.numeroTavoli = t;
				break;
			}
		}
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
	svuotaPrenotazione(): void {
		this.filialeId = 0;
		this.numeroPosti = 0;
		this.dataPrenotazione = '';
		this.oraPrenotazione = '';
	}

	getNumeroTavoli(): number {
		return this.numeroTavoli;
	}
}
