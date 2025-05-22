import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonList, IonItem } from '@ionic/angular/standalone';
import { HeroComponent } from 'src/app/components/hero/hero.component';

import { ProdottoService } from 'src/app/core/services/prodotto.service';
import { IonSpinner } from '@ionic/angular/standalone';
import { ProdottoRecord } from 'src/app/core/interfaces/Prodotto';
import { PiattoDelGiornoComponent } from '../../components/piatto-del-giorno/piatto-del-giorno.component';
import { MenuDividerComponent } from '../../components/menu-divider/menu-divider.component';
import { ApiResponse } from 'src/app/core/interfaces/ApiResponse';

@Component({
	selector: 'app-menu',
	templateUrl: './menu.page.html',
	styleUrls: ['./menu.page.scss'],
	standalone: true,
	imports: [
		IonContent,
		CommonModule,
		HeroComponent,
		IonSpinner,
		PiattoDelGiornoComponent,
		MenuDividerComponent,
	],
})
export class MenuPage implements OnInit {
	piatti: ProdottoRecord[] = [];
	primi: ProdottoRecord[] = [];
	antipasti: ProdottoRecord[] = [];
	dolci: ProdottoRecord[] = [];
	bevande: ProdottoRecord[] = [];

	loading: boolean = true;
	menuAperto: string | null = null;
	error: boolean = false;

	constructor(private prodottoService: ProdottoService) {}

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

	AperturaLista(categoria: string) {
		this.menuAperto = this.menuAperto === categoria ? null : categoria;
	}
}
