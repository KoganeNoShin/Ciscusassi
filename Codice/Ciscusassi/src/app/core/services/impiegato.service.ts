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
	
	/**
   * @remarks
   * Recuperiamo {@link environment.apiURL l'URL dell'API} dal file di ambiente {@link environment} 
   * per effettuare le richieste HTTP
	*/
	private apiURL = environment.apiURL;

	constructor(private http: HttpClient) {}

	/**
   * @remarks
   * La seguente funzione è utilizzata per effettuare una richiesta POST
   * all'API per aggiungere un nuovo impiegato. Viene passato un oggetto {@link ImpiegatoInput} 
   * contenente i dati dell'impiegato da aggiungere.
   * La rotta dell'API utilizzata è la `/filiale/addImpiegato`, definita nel file routes.ts.
   * @returns
   * Un Observable di tipo ApiResponse che contiene un oggetto {@link ImpiegatoRecord} con i dati dell'impiegato aggiunto.
   */
	AddImpiegato(
		impiegato: ImpiegatoInput
	): Observable<ApiResponse<ImpiegatoRecord>> {
		return this.http.post<ApiResponse<ImpiegatoRecord>>(
			`${this.apiURL}/filiale/addImpiegato`,
			impiegato
		);
	}

	/**
   * @remarks
   * La seguente funzione è utilizzata per effettuare una richiesta PUT
   * all'API per aggiornare i dati di un impiegato. Viene passato l'id dell'impiegato
   * che si intende modificare e i nuovi dati dell'impiegato in un oggetto {@link ImpiegatoData}.
   * La rotta dell'API utilizzata è la `/filiale/updateImpiegato/{matricola}`, definita nel file routes.ts.
   * @returns
   * Un Observable di tipo ApiResponse che contiene un oggetto {@link ImpiegatoRecord} con i dati aggiornati dell'impiegato.
   */
	UpdateImpiegato(
		matricola: number,
		impiegato: ImpiegatoData
	): Observable<ApiResponse<ImpiegatoRecord>> {
		return this.http.put<ApiResponse<ImpiegatoRecord>>(
			`${this.apiURL}/filiale/updateImpiegato/${matricola}`,
			impiegato
		);
	}

	/**
   * @remarks
   * La seguente funzione è utilizzata per effettuare una richiesta DELETE
   * all'API per eliminare un impiegato specifico. Viene passato l'id dell'impiegato da eliminare.
   * La rotta dell'API utilizzata è la `/filiale/deleteImpiegato/{matricola}`, definita nel file routes.ts.
   * @returns
   * Un Observable di tipo ApiResponse void.
   */
	DeleteImpiegato(matricola: number): Observable<ApiResponse<void>> {
		return this.http.delete<ApiResponse<void>>(
			`${this.apiURL}/filiale/deleteImpiegato/${matricola}`
		);
	}

	/**
	 * @remarks
	 * La seguente funzione è utilizzata per effettuare una richiesta GET
	 * all'API per ottenere tutti gli impiegati di una specifica filiale.
	 * La rotta dell'API utilizzata è la `/filiale/{filialeId}/impiegati`, definita nel file routes.ts.
	 * @returns
	 * Un Observable di tipo ApiResponse che contiene un array di oggetti {@link ImpiegatoRecord}.
	 */
	GetImpiegati(
		filialeId: number
	): Observable<ApiResponse<ImpiegatoRecord[]>> {
		return this.http.get<ApiResponse<ImpiegatoRecord[]>>(
			`${this.apiURL}/filiale/${filialeId}/impiegati`
		);
	}
}
