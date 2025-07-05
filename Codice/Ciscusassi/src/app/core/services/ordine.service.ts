import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../interfaces/ApiResponse';
import { Observable } from 'rxjs';
import { ProdottoInput } from '../interfaces/Prodotto';
import { OrdProdEstended, OrdProdInput } from '../interfaces/OrdProd';

@Injectable({
	providedIn: 'root',
})
export class OrdineService {
	/**
	 * @remarks
	 * Recuperiamo {@link environment.apiURL l'URL dell'API} dal file di ambiente {@link environment} 
	 * per effettuare le richieste HTTP
	 */
	private apiURL = environment.apiURL;
	prodottiOrdinati: OrdProdEstended[] = [];

	constructor(private http: HttpClient) {}

	/**
	 * @remarks
	 * La seguente funzione è utilizzata per effettuare una richiesta POST
	 * all'API per aggiungere un nuovo ordine. Viene passato un oggetto contenente
	 * il nome utente dell'ordinante e il riferimento alla prenotazione.
	 * La rotta dell'API utilizzata è la `/prenotazione/addOrdini`, definita nel file routes.ts.
	 * @returns
	 * Un Observable di tipo ApiResponse void.
	 */
	addOrdine(
		username: string,
		ref_prenotazione: number
	): Observable<ApiResponse<any>> {
		const body = {
			username_ordinante: username,
			ref_prenotazione: ref_prenotazione,
		};

		return this.http.post<ApiResponse<any>>(
			`${this.apiURL}/prenotazione/addOrdine`,
			body
		);
	}

	/**
	 * @remarks
	 * La seguente funzione è utilizzata per effettuare una richiesta PUT
	 * all'API per cambiare lo stato di un prodotto ordinato. Viene passato lo stato desiderato e l'id dell'ord prod.
	 * La rotta dell'API utilizzata è la `/prenotazione/ordine/prodotto/{id}/cambiaStato`, definita nel file routes.ts.
	 * @returns
	 * Un Observable di tipo ApiResponse void.
	 */
	cambiaStato(stato: string, id: number): Observable<ApiResponse<any>> {
		const body = {
			stato: stato,
		};

		return this.http.put<ApiResponse<any>>(
			`${this.apiURL}/prenotazione/ordine/prodotto/${id}/cambiaStato`,
			body
		);
	}

	/**
	 * @remarks
	 * La seguente funzione è utilizzata per effettuare una richiesta POST
	 * all'API per aggiungere prodotti a un ordine. Viene passato un array di oggetti {@link OrdProdInput}.
	 * La rotta dell'API utilizzata è la `/prenotazione/ordine/addProdotti`, definita nel file routes.ts.
	 * @returns
	 * Un Observable di tipo ApiResponse void.
	 */
	ordineAddProdotti(
		ref_prodotto: OrdProdInput[]
	): Observable<ApiResponse<any>> {
		const body = ref_prodotto;

		return this.http.post<ApiResponse<any>>(
			`${this.apiURL}/prenotazione/ordine/addProdotti`,
			body,
			{ headers: { 'Content-Type': 'application/json' } }
		);
	}

	/**
	 * @remarks
	 * La seguente funzione è utilizzata per effettuare una richiesta PUT
	 * all'API per cambiare lo stato di un prodotto ordinato in "romana" o meno.
	 * Viene passato l'id dell'ordine prodotto e un booleano che indica se è romana.
	 * La rotta dell'API utilizzata è la `/prenotazione/ordine/prodotto/{id_ordprod}/isRomana`, definita nel file routes.ts.
	 * @returns
	 * Un Observable di tipo ApiResponse void.
	 */
	cambiaRomana(
		id_ordprod: number,
		isRomana: boolean
	): Observable<ApiResponse<any>> {
		const body = {
			isRomana: isRomana,
		};
		return this.http.put<ApiResponse<any>>(
			`${this.apiURL}/prenotazione/ordine/prodotto/${id_ordprod}/isRomana`,
			body,
			{ headers: { 'Content-Type': 'application/json' } }
		);
	}

	/**
	 * @remarks
	 * La seguente funzione è utilizzata per effettuare una richiesta GET
	 * all'API per ottenere i prodotti ordinati.
	 * Viene passato l'id dell'ordine.
	 * La rotta dell'API utilizzata è la `/prenotazione/ordine/{id}/prodotti`, definita nel file routes.ts.
	 * @returns
	 * Un Observable di tipo ApiResponse che contiene un array di oggetti {@link OrdProdEstended}.
	 */
	getProdottiOrdinatiByNumeroOrdine(
		id: number
	): Observable<ApiResponse<OrdProdEstended[]>> {
		return this.http.get<ApiResponse<OrdProdEstended[]>>(
			`${this.apiURL}/prenotazione/ordine/${id}/prodotti`
		);
	}

	/**
	 * @remarks
	 * La seguente funzione è utilizzata per effettuare una richiesta GET
	 * all'API per ottenere i prodotti ordinati da una prenotazione specifica.
	 * Viene passato l'id della prenotazione.
	 * La rotta dell'API utilizzata è la `/prenotazione/{idPrenotazione}/prodotti`, definita nel file routes.ts.
	 * @returns
	 * Un Observable di tipo ApiResponse che contiene un array di oggetti {@link OrdProdEstended}.
	 */
	getProdottiOrdinatiByPrenotazione(
		idPrenotazione: number
	): Observable<ApiResponse<OrdProdEstended[]>> {
		return this.http.get<ApiResponse<OrdProdEstended[]>>(
			`${this.apiURL}/prenotazione/${idPrenotazione}/prodotti`
		);
	}

	/**
	 * @remarks
	 * La seguente funzione è utilizzata per effettuare una richiesta GET
	 * all'API per ottenere i prodotti ordinati da un utente specifico in una prenotazione.
	 * Viene passato l'id della prenotazione e il nome utente dell'utente.
	 * La rotta dell'API utilizzata è la `/prenotazione/{idPrenotazione}/ordini/{username}`, definita nel file routes.ts.
	 * @returns
	 * Un Observable di tipo ApiResponse che contiene un array di oggetti {@link OrdProdEstended}.
	 */
	getProdottiOrdinatiByUsername(
		idPrenotazione: number,
		username: string
	): Observable<ApiResponse<any>> {
		return this.http.get<ApiResponse<any>>(
			`${this.apiURL}/prenotazione/${idPrenotazione}/ordini/${username}`
		);
	}

	/**
	 * @remarks
	 * La seguente funzione è utilizzata per impostare i prodotti ordinati.
	 * Viene passato un array di oggetti {@link OrdProdEstended}.
	 */
	setProdottiOrdinati(prodottiOrdinati: OrdProdEstended[]) {
		this.prodottiOrdinati = prodottiOrdinati;
	}

	/**
	 * @remarks
	 * La seguente funzione è utilizzata per ottenere i prodotti ordinati.
	 * Restituisce un array di oggetti {@link OrdProdEstended}.
	 */
	getProdottiOrdinati(): OrdProdEstended[] {
		return this.prodottiOrdinati;
	}
}
