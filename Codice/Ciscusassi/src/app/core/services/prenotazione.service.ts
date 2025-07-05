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
	/**
	 * @remarks
	 * Recuperiamo {@link environment.apiURL l'URL dell'API} dal file di ambiente {@link environment} 
	 * per effettuare le richieste HTTP
	 */
	private apiURL = environment.apiURL;

	// Dati locali temporanei
	private filialeId: number = 0;
	private numeroPosti: number = 0;
	private dataPrenotazione: string = '';
	private oraPrenotazione: string = '';
	private numeroTavoli: number = 0;

	constructor(private http: HttpClient) {}

	/**
	 * Metodo per ottenere tutte le prenotazioni.
	 * @returns Un Observable di tipo ApiResponse che contiene un array di oggetti {@link PrenotazioneRecord}.
	 */
	getAllPrenotazioni(): Observable<ApiResponse<PrenotazioneRecord[]>> {
		return this.http.get<ApiResponse<PrenotazioneRecord[]>>(
			`${this.apiURL}/prenotazioni`
		);
	}

	/**
	 * Metodo per ottenere le prenotazioni di una filiale specifica.
	 * @param idFiliale L'ID della filiale.
	 * @returns Un Observable di tipo ApiResponse che contiene un array di oggetti {@link PrenotazioneRecord}.
	 */
	getPrenotazioneById(
		id: number
	): Observable<ApiResponse<PrenotazioneRecord>> {
		return this.http.get<ApiResponse<PrenotazioneRecord>>(
			`${this.apiURL}/prenotazione/${id}`
		);
	}

	/**
	 * @remarks
	 * La seguente funzione è utilizzata per effettuare una richiesta POST
	 * all'API per verificare che l'OTP inserito sia corretto. Viene passata la data e ora della prenotazione,
	 * il riferimento alla torretta e l'OTP inserito dall'utente.
	 * La rotta dell'API utilizzata è la `/prenotazione/check-otp`, definita nel file routes.ts.
	 * @returns
	 * Un Observable di tipo ApiResponse che contiene un oggetto di tipo `any`.
	 */
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

	/**
	 * @remarks
	 * La seguente funzione è utilizzata per effettuare una richiesta GET
	 * all'API per ottenere le prenotazioni di un cliente specifico.
	 * La rotta dell'API utilizzata è la `/cliente/prenotazioni`, definita nel file routes.ts.
	 * @returns
	 * Un Observable di tipo ApiResponse che contiene un array di oggetti {@link PrenotazioneWithFiliale}.
	 */
	getPrenotazioniByCliente(): Observable<
		ApiResponse<PrenotazioneWithFiliale[]>
	> {
		return this.http.get<ApiResponse<PrenotazioneWithFiliale[]>>(
			`${this.apiURL}/cliente/prenotazioni`
		);
	}

	/**
	 * @remarks
	 * La seguente funzione è utilizzata per effettuare una richiesta GET
	 * all'API per ottenere le prenotazioni di una specifica filiale, in cui lavora un cameriere.
	 * La rotta dell'API utilizzata è la `/prenotazione/cameriere/{clienteId}`, definita nel file routes.ts.
	 * @returns
	 * Un Observable di tipo ApiResponse che contiene un array di oggetti {@link PrenotazioneWithFiliale}.
	 */
	getPrenotazioniByClienteCameriere(
		clienteId: number
	): Observable<ApiResponse<PrenotazioneWithFiliale[]>> {
		return this.http.get<ApiResponse<PrenotazioneWithFiliale[]>>(
			`${this.apiURL}/prenotazione/cameriere/${clienteId}/`
		);
	}

	/**
	 * @remarks
	 * La seguente funzione è utilizzata per effettuare una richiesta GET
	 * all'API per ottenere il totale associato a un ordine. Viene passato l'id dell'ordine.
	 * La rotta dell'API utilizzata è la `/prenotazione/ordine/{idOrdine}/totale`, definita nel file routes.ts.
	 * @returns
	 * Un Observable di tipo ApiResponse che contiene un array di oggetti `any`.
	 */
	getTotaleByOrdine(idOrdine: number): Observable<ApiResponse<any>> {
		return this.http.get<ApiResponse<any>>(
			`${this.apiURL}/prenotazione/ordine/${idOrdine}/totale`
		);
	}

	/**
	 * @remarks
	 * La seguente funzione è utilizzata per effettuare una richiesta GET
	 * all'API per ottenere le prenotazioni del giorno di una filiale.
	 * La rotta dell'API utilizzata è la `/prenotazione/filiale/prenotazioni`, definita nel file routes.ts.
	 * @returns
	 * Un Observable di tipo ApiResponse che contiene un array di oggetti {@link PrenotazioneRecord}.
	 */
	getPrenotazioniDelGiornoFiliale(): Observable<
		ApiResponse<PrenotazioneRecord[]>
	> {
		return this.http.get<ApiResponse<PrenotazioneRecord[]>>(
			`${this.apiURL}/prenotazione/filiale/prenotazioni`
		);
	}

	/**
	 * @remarks
	 * La seguente funzione è utilizzata per effettuare una richiesta GET
	 * all'API per ottenere lo stato delle prenotazioni del giorno di una filiale, in cui lavora un cameriere.
	 * Viene passato l'id della prenotazione.
	 * La rotta dell'API utilizzata è la `/prenotazione/{id}/cameriere/stato`, definita nel file routes.ts.
	 * @returns
	 * Un Observable di tipo ApiResponse che contiene un oggetto con `success` e `data`.
	 * `data` contiene lo stato della prenotazione come stringa.
	 */
	getStatoPrenotazioneCameriere(id: number) {
		return this.http.get<{ success: boolean; data: string }>(
			`${this.apiURL}/prenotazione/${id}/cameriere/stato`
		);
	}

	/**
	 * @remarks
	 * La seguente funzione è utilizzata per effettuare una richiesta GET
	 * all'API per ottenere lo stato delle prenotazioni del giorno di una filiale, in cui lavora uno chef.
	 * Viene passato l'id della prenotazione.
	 * La rotta dell'API utilizzata è la `/prenotazione/{id}/chef/stato`, definita nel file routes.ts.
	 * @returns
	 * Un Observable di tipo ApiResponse che contiene un oggetto con `success` e `data`.
	 * `data` contiene lo stato della prenotazione come stringa.
	 */
	getStatoPrenotazioneChef(id: number) {
		return this.http.get<{ success: boolean; data: string }>(
			`${this.apiURL}/prenotazione/${id}/chef/stato`
		);
	}

	/**
	 * @remarks
	 * La seguente funzione è utilizzata per effettuare una richiesta GET
	 * all'API per ottenere i tavoli in uso.
	 * La rotta dell'API utilizzata è la `/prenotazione/tavoli-in-uso`, definita nel file routes.ts.
	 * @returns
	 * Un Observable che contiene un array di oggetti `any`.
	 */
	getTavoliInUso(): Observable<any> {
		return this.http.get(`${this.apiURL}/prenotazione/tavoli-in-uso`);
	}

	/**
	 * @remarks
	 * La seguente funzione è utilizzata per effettuare una richiesta POST
	 * all'API per prenotare un tavolo. Viene passato un oggetto {@link PrenotazioneRequest}.
	 * La rotta dell'API utilizzata è la `/prenotazione/prenota`, definita nel file routes.ts.
	 * @returns
	 * Un Observable di tipo ApiResponse che contiene un oggetto di tipo `any`.
	 */
	prenota(data: PrenotazioneRequest): Observable<ApiResponse<any>> {
		return this.http.post<ApiResponse<any>>(
			`${this.apiURL}/prenotazione/prenota`,
			data
		);
	}

	/**
	 * @remarks
	 * La seguente funzione è utilizzata per effettuare una richiesta POST
	 * all'API per prenotare un tavolo in un locale. Viene passato un oggetto {@link PrenotazioneRequest}.
	 * La rotta dell'API utilizzata è la `/prenotazione/prenotaLoco`, definita nel file routes.ts.
	 * @returns
	 * Un Observable di tipo ApiResponse che contiene un oggetto di tipo `any`.
	 */
	prenotaLoco(data: PrenotazioneRequest): Observable<ApiResponse<any>> {
		return this.http.post<ApiResponse<any>>(
			`${this.apiURL}/prenotazione/prenotaLoco`,
			data
		);
	}

	/**
	 * @remarks
	 * La seguente funzione è utilizzata per effettuare una richiesta POST
	 * all'API per confermare una prenotazione. Viene passato l'id della prenotazione.
	 * La rotta dell'API utilizzata è la `/prenotazione/conferma`, definita nel file routes.ts.
	 * @returns
	 * Un Observable di tipo ApiResponse che contiene un oggetto di tipo `any`.
	 */
	confermaPrenotazione(id: number): Observable<ApiResponse<any>> {
		return this.http.post<ApiResponse<any>>(
			`${this.apiURL}/prenotazione/conferma`,
			{ id_prenotazione: id }
		);
	}

	/**
	 * @remarks
	 * La seguente funzione è utilizzata per effettuare una richiesta PUT
	 * all'API per modificare una prenotazione. Viene passato un oggetto {@link PrenotazioneRecord}.
	 * La rotta dell'API utilizzata è la `/prenotazione/modificaPrenotazione`, definita nel file routes.ts.
	 * @returns
	 * Un Observable di tipo ApiResponse che contiene un oggetto di tipo `any`.
	 */
	modificaPrenotazione(
		data: PrenotazioneRecord
	): Observable<ApiResponse<any>> {
		return this.http.put<ApiResponse<any>>(
			`${this.apiURL}/prenotazione/modificaPrenotazione`,
			data
		);
	}

	/**
	 * @remarks
	 * La seguente funzione è utilizzata per effettuare una richiesta DELETE
	 * all'API per eliminare una prenotazione. Viene passato l'id della prenotazione.
	 * La rotta dell'API utilizzata è la `/prenotazione/eliminaPrenotazione/{id}`, definita nel file routes.ts.
	 * @returns
	 * Un Observable di tipo ApiResponse che contiene un oggetto di tipo `any`.
	 */
	eliminaPrenotazione(id: number): Observable<ApiResponse<any>> {
		return this.http.delete<ApiResponse<any>>(
			`${this.apiURL}/prenotazione/eliminaPrenotazione/${id}`
		);
	}

	/**
	 * @remarks
	 * La seguente funzione è utilizzata per effettuare una richiesta GET
	 * all'API per ottenere i tavoli in uso in una data specifica.
	 * La rotta dell'API utilizzata è la `/prenotazione/filiale/tavoli-in-uso?data={data}`, definita nel file routes.ts.
	 * @returns
	 * Un Observable di tipo ApiResponse che contiene un oggetto con `success` e `data`.
	 * `data` è una stringa che contiene data e ora.
	 */
	tavoliInUso(data: string): Observable<ApiResponse<any>> {
		return this.http
			.get<{
				[fascia: string]: number;
			}>(`${this.apiURL}/prenotazione/filiale/tavoli-in-uso?data=${data}`)
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
