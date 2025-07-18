import { Component, OnInit } from '@angular/core';
import { ProdottoService } from 'src/app/core/services/prodotto.service';
import { IonSpinner, IonText } from '@ionic/angular/standalone';
import { ApiResponse } from 'src/app/core/interfaces/ApiResponse';
import { ProdottoRecord } from 'src/app/core/interfaces/Prodotto';

/**
 * Componente custom utilizzato per mostrare il piatto del giorno.
 *
 * All'inizializzazione invoca {@link ProdottoService.GetPiattoDelGiorno}
 * per ricevere i dati del piatto del giorno corrente e mostrarli.
 *
 */
@Component({
	selector: 'app-piatto-del-giorno',
	templateUrl: './piatto-del-giorno.component.html',
	styleUrls: ['./piatto-del-giorno.component.scss'],
	standalone: true,
	imports: [IonText, IonSpinner],
})
export class PiattoDelGiornoComponent implements OnInit {
	piatto: ProdottoRecord | undefined;
	loading: boolean = true;
	error: boolean = false;

	constructor(private prodottoService: ProdottoService) {}

	/**
	 * Gestiamo la rispsota alla richiesta del piatto del giorno,
	 * se successo allora memorizza i dati altrimenti memorizza errore
	 *
	 * @param response la risposta che ha restituito il server
	 */
	private handleResponse(response: ApiResponse<ProdottoRecord>): void {
		if (response.success && response.data) {
			this.piatto = response.data;
			this.piatto.nome = this.piatto.nome.toUpperCase();
		} else {
			if (response.success){
				this.piatto = undefined;
			} else {
				console.error(response.message || 'Errore sconosciuto');
				this.error = true;
			}
		}

		this.loading = false;
	}

	/**
	 * All'inizio del life-cicle del componente, mandiamo una richiesta
	 * tramite la prodottoService per prendere il piatto del giorno corrente,
	 * in modo tale da poter mostrare tutte le sue informazioni
	 */
	ngOnInit() {
		this.prodottoService.GetPiattoDelGiorno().subscribe({
			next: (response) => this.handleResponse(response),
			error: (err) => {
				console.log(err);
				this.error = true;
				this.loading = false;
			},
		});
	}
}
