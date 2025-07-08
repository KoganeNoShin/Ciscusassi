import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProdottoService } from 'src/app/core/services/prodotto.service';
import { IonSpinner } from '@ionic/angular/standalone';
import { ProdottoRecord } from 'src/app/core/interfaces/Prodotto';
import { MenuDividerComponent } from '../../components/menu-divider/menu-divider.component';
import { ApiResponse } from 'src/app/core/interfaces/ApiResponse';
import { ProdottoMenuComponent } from '../prodotto-menu/prodotto-menu.component';

/**
 * Questo componente viene utilizando quando l'utente sta sfogliando il menu,
 * sia durante la visita al menu che durante l'ordinazione vera e propria.
 *
 * Permette all'utente di scegliere una categoria da espandere, mostrandone il contenuto.
 *
 * @param isOrdinazione - Valore booleano che viene passato ai componenti {@link ProdottoMenuComponent ProdottoMenu},
 * qualora fosse impostato a `true`, mostrerebbe i controlli per effettuare un ordine (aggiungi e rimuovi ordine)
 *
 */
@Component({
	selector: 'app-lista-menu',
	templateUrl: './lista-menu.component.html',
	styleUrls: ['./lista-menu.component.scss'],
	standalone: true,
	imports: [
		CommonModule,
		IonSpinner,
		MenuDividerComponent,
		ProdottoMenuComponent,
	],
})
export class ListaMenuComponent implements OnInit {
	/** Qualora fossimo in ordinazione, in modo tale da mostrare i corretti comandi */
	@Input() isOrdinazione: boolean = false;

	/** Tutti i piatti che sono stati ricevuti dal backend */
	piatti: ProdottoRecord[] = [];

	/** Esclusivamente i primi piatti */
	primi: ProdottoRecord[] = [];

	/** Esclusivamente gli antipasti */
	antipasti: ProdottoRecord[] = [];

	/** Esclusivamente i dolci */
	dolci: ProdottoRecord[] = [];

	/** Esclusivamente le bevande */
	bevande: ProdottoRecord[] = [];

	loading: boolean = true;
	menuAperto: string | null = null;
	error: boolean = false;

	constructor(private prodottoService: ProdottoService) {}

	/**
	 * @remarks
	 * Gestiamo la risposta del server, e filtriamo i piatti per categoria in diversi array
	 * per poterli gestire filtrandoli tramite i {@link MenuDividerComponent Menu Divider}
	 *
	 * @param response la risposta di tipo {@link ProdottoRecord} che ha restituito l'API.
	 */
	private handleResponse(response: ApiResponse<ProdottoRecord[]>): void {
		console.log(response);

		if (response.success && response.data) {
			this.piatti = response.data;

			// Filtra i piatti per categoria
			this.primi = this.piatti.filter((p) => p.categoria === 'PRIMO');
			this.antipasti = this.piatti.filter(
				(p) => p.categoria === 'ANTIPASTO'
			);
			this.dolci = this.piatti.filter((p) => p.categoria === 'DOLCE');
			this.bevande = this.piatti.filter((p) => p.categoria === 'BEVANDA');
		} else {
			console.error(response.message || 'Errore sconosciuto');
			this.error = true;
		}

		this.loading = false;
	}

	/**
	 * @remarks
	 * All'inizio del life-cycle della lista-menu, mandiamo una richiesta
	 * alla {@link ProdottoService.GetProdotti} per ricevere tutti i prodotti,
	 * richiamando la {@link handleResponse} per gestire i valori ricevuti
	 */
	ngOnInit() {
		this.prodottoService.GetProdotti().subscribe({
			next: (response) => this.handleResponse(response),
			error: (err) => {
				console.log(err);
				this.loading = false;
				this.error = true;
			},
		});
	}

	/**
	 * Assegna la categoria in base al bottone premuto ed apre la rispettiva lista
	 * @param categoria la categoria di piatto da visualizzare
	 */
	AperturaLista(categoria: string) {
		this.menuAperto = this.menuAperto === categoria ? null : categoria;
	}
}
