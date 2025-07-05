import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../interfaces/ApiResponse';
import { AsportoInput, AsportoRecord } from '../interfaces/Asporto';

@Injectable({
	providedIn: 'root',
})

export class AsportoService {
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
   * all'API per creare un nuovo asporto. Viene passato un oggetto {@link AsportoInput} nel quale
   * sono contenuti i dati necessari per creare l'asporto, tra cui anche i prodotti.
   * La rotta dell'API utilizzata è la `/addAsporto`, definita nel file routes.ts.
   * @returns
   * Un Observable di tipo ApiResponse che contiene un number, che rappresenta l'id dell'asporto appena creato.
   */
	addProdotto(prodotti: AsportoInput): Observable<ApiResponse<number>> {
		return this.http.post<ApiResponse<number>>(
			`${this.apiURL}/addAsporto`,
			prodotti
		);
	}
}
