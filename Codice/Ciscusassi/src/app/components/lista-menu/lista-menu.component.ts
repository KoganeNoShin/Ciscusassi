import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProdottoService } from 'src/app/core/services/prodotto.service';
import { IonSpinner } from '@ionic/angular/standalone';
import { ProdottoRecord } from 'src/app/core/interfaces/Prodotto';
import { MenuDividerComponent } from '../../components/menu-divider/menu-divider.component';
import { ApiResponse } from 'src/app/core/interfaces/ApiResponse';
import { ProdottoMenuComponent } from 'src/app/components/prodotto-menu/prodotto-menu.component';


@Component({
  selector: 'app-lista-menu',
  templateUrl: './lista-menu.component.html',
  styleUrls: ['./lista-menu.component.scss'],
  standalone: true,
  imports: [
		CommonModule,
		IonSpinner,
		MenuDividerComponent,
		ProdottoMenuComponent]
})

export class ListaMenuComponent  implements OnInit {
  	piatti: ProdottoRecord[] = [];
    primi: ProdottoRecord[] = [];
    antipasti: ProdottoRecord[] = [];
    dolci: ProdottoRecord[] = [];
    bevande: ProdottoRecord[] = [];
  
    loading: boolean = true;
    menuAperto: string | null = null;
    error: boolean = false;
    @Input() isOrdinazione: boolean = false;

  constructor(private prodottoService: ProdottoService) { }

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
