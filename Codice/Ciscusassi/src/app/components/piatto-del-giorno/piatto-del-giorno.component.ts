import { Component, OnInit } from '@angular/core';
import { ProdottoService } from 'src/app/core/services/prodotto.service';
import { IonSpinner } from '@ionic/angular/standalone';
import { ApiResponse } from 'src/app/core/interfaces/ApiResponse';
import { ProdottoRecord } from 'src/app/core/interfaces/Prodotto';

@Component({
	selector: 'app-piatto-del-giorno',
	templateUrl: './piatto-del-giorno.component.html',
	styleUrls: ['./piatto-del-giorno.component.scss'],
	standalone: true,
	imports: [IonSpinner],
})
export class PiattoDelGiornoComponent implements OnInit {
	piatto: ProdottoRecord | undefined;
	loading: boolean = true;
	error: boolean = false;

	constructor(private prodottoService: ProdottoService) {}

	private handleResponse(response: ApiResponse<ProdottoRecord>): void {
		console.log(response);

		if (response.success && response.data) {
			this.piatto = response.data;
			this.piatto.nome = this.piatto.nome.toUpperCase();
		} else {
			console.error(response.message || 'Errore sconosciuto');
			this.error = true;
		}

		this.loading = false;
	}

	ngOnInit() {
		this.ngDoCheck();
	}

	ngDoCheck(){
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
