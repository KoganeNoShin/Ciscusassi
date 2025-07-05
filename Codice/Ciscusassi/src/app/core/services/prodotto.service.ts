import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../interfaces/ApiResponse';
import { ProdottoInput, ProdottoRecord } from '../interfaces/Prodotto';

@Injectable({
	providedIn: 'root',
})
export class ProdottoService {
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
	 * all'API per ottenere tutti i prodotti del menu.
	 * La rotta dell'API utilizzata è la `/menu`, definita nel file routes.ts.
	 * @returns
	 * Un Observable di tipo ApiResponse che contiene un array di oggetti {@link ProdottoRecord}.
	 */
	GetProdotti(): Observable<ApiResponse<ProdottoRecord[]>> {
		return this.http.get<ApiResponse<ProdottoRecord[]>>(
			`${this.apiURL}/menu`
		);
	}

	/**
	 * @remarks
	 * La seguente funzione è utilizzata per effettuare una richiesta GET
	 * all'API per ottenere un prodotto specifico del menu.
	 * La rotta dell'API utilizzata è la `/menu/piattoDelGiorno`, definita nel file routes.ts.
	 * @returns
	 * Un Observable di tipo ApiResponse che contiene un oggetto {@link ProdottoRecord}.
	 */
	GetPiattoDelGiorno(): Observable<ApiResponse<ProdottoRecord>> {
		return this.http.get<ApiResponse<ProdottoRecord>>(
			`${this.apiURL}/menu/piattoDelGiorno`
		);
	}

	/**
	 * @remarks
	 * La seguente funzione è utilizzata per effettuare una richiesta PUT
	 * all'API per cambiare il piatto del giorno.
	 * La rotta dell'API utilizzata è la `/menu/changePiattoDelGiorno/{id}`, definita nel file routes.ts.
	 * @param id - L'id del prodotto da impostare come piatto del giorno.
	 * @returns
	 * Un Observable di tipo ApiResponse che contiene un oggetto {@link ProdottoRecord}.
	 */
	changePiattoDelGiorno(id: number): Observable<ApiResponse<ProdottoRecord>> {
		return this.http.put<ApiResponse<ProdottoRecord>>(
			`${this.apiURL}/menu/changePiattoDelGiorno/${id}`,
			{}
		);
	}

	/**
	 * @remarks
	 * La seguente funzione è utilizzata per effettuare una richiesta POST
	 * all'API per aggiungere un nuovo prodotto al menu.
	 * La rotta dell'API utilizzata è la `/menu/addProdotto`, definita nel file routes.ts.
	 * @param prodotto - Un oggetto di tipo {@link ProdottoInput} che rappresenta il prodotto da aggiungere.
	 * @returns
	 * Un Observable di tipo ApiResponse che contiene un numero, l'id del prodotto aggiunto.
	 */
	addProdotto(prodotto: ProdottoInput): Observable<ApiResponse<number>> {
		return this.http.post<ApiResponse<number>>(
			`${this.apiURL}/menu/addProdotto`,
			prodotto
		);
	}

	/**
	 * @remarks
	 * La seguente funzione è utilizzata per effettuare una richiesta PUT
	 * all'API per aggiornare un prodotto esistente nel menu.
	 * La rotta dell'API utilizzata è la `/menu/updateProdotto/{id}`, definita nel file routes.ts.
	 * @param id - L'id del prodotto da aggiornare.
	 * @param prodotto - Un oggetto di tipo {@link ProdottoInput} che rappresenta il prodotto aggiornato.
	 * @returns
	 * Un Observable di tipo ApiResponse che contiene un oggetto vuoto.
	 */
	updateProdotto(
		id: number,
		prodotto: ProdottoInput
	): Observable<ApiResponse<void>> {
		return this.http.put<ApiResponse<void>>(
			`${this.apiURL}/menu/updateProdotto/${id}`,
			prodotto
		);
	}

	/**
	 * @remarks
	 * La seguente funzione è utilizzata per effettuare una richiesta DELETE
	 * all'API per eliminare un prodotto dal menu.
	 * La rotta dell'API utilizzata è la `/menu/deleteProdotto/{id}`, definita nel file routes.ts.
	 * @param id - L'id del prodotto da eliminare.
	 * @returns
	 * Un Observable di tipo ApiResponse void.
	 */
	deleteProdotto(id: number): Observable<ApiResponse<void>> {
		return this.http.delete<ApiResponse<void>>(
			`${this.apiURL}/menu/deleteProdotto/${id}`
		);
	}
}
