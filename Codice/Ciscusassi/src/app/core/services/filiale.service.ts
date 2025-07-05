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

	/**
   * @remarks
   * Recuperiamo {@link environment.apiURL l'URL dell'API} dal file di ambiente {@link environment} 
   * per effettuare le richieste HTTP
	*/
	private apiURL = environment.apiURL;

	constructor(private http: HttpClient) {}

	/**
   * @remarks
   * La seguente funzione è utilizzata per effettuare una richiesta GET
   * all'API per ottenere tutte le filiali.
   * La rotta dell'API utilizzata è la `/filiale`, definita nel file routes.ts.
   * @returns
   * Un Observable di tipo ApiResponse che contiene una lista di oggetti {@link FilialeRecord}.
   */
	GetSedi(): Observable<ApiResponse<FilialeRecord[]>> {
		return this.http.get<ApiResponse<FilialeRecord[]>>(
			`${this.apiURL}/filiale`
		);
	}

	/**
   * @remarks
   * La seguente funzione è utilizzata per effettuare una richiesta POST
   * all'API per creare una nuova filiale. Viene passato un oggetto {@link FilialeInput} nel quale
   * sono contenuti i dati necessari per creare la filiale.
   * La rotta dell'API utilizzata è la `/filiale/addFiliale`, definita nel file routes.ts.
   * @returns
   * Un Observable di tipo ApiResponse che contiene un number, che rappresenta l'id della filiale appena creata.
   */
	addFiliale(filiale: FilialeInput): Observable<ApiResponse<number>> {
		return this.http.post<ApiResponse<number>>(
			`${this.apiURL}/filiale/addFiliale`,
			filiale
		);
	}

	/**
   * @remarks
   * La seguente funzione è utilizzata per effettuare una richiesta PUT
   * all'API per aggiornare i dati della filiale. Vengono passati l'id della filiale
   * che si intende modificare e i nuovi dati della filiale in un oggetto {@link FilialeInput}.
   * La rotta dell'API utilizzata è la `/filiale/updateFiliale/id`, definita nel file routes.ts.
   * @returns
   * Un Observable di tipo ApiResponse void.
   */
	updateFiliale(
		id: number,
		filiale: FilialeInput
	): Observable<ApiResponse<void>> {
		return this.http.put<ApiResponse<void>>(
			`${this.apiURL}/filiale/updateFiliale/${id}`,
			filiale
		);
	}

	/**
   * @remarks
   * La seguente funzione è utilizzata per effettuare una richiesta DELETE
   * all'API per eliminare una filiale specifica. Viene passato l'id della filiale da eliminare.
   * La rotta dell'API utilizzata è la `/filiale/deleteFiliale/id`, definita nel file routes.ts.
   * @returns
   * Un Observable di tipo ApiResponse void.
   */
	deleteFiliale(id: number): Observable<ApiResponse<void>> {
		return this.http.delete<ApiResponse<void>>(
			`${this.apiURL}/filiale/deleteFiliale/${id}`
		);
	}
}
