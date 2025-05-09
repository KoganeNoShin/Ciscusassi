import { Component, OnInit } from '@angular/core';
import { PiattoDelGiornoService } from './piatto-del-giorno.service';
import { IonSpinner } from '@ionic/angular/standalone';

@Component({
	selector: 'app-piatto-del-giorno',
	templateUrl: './piatto-del-giorno.component.html',
	styleUrls: ['./piatto-del-giorno.component.scss'],
	standalone: true,
	imports: [IonSpinner]
})
export class PiattoDelGiornoComponent implements OnInit {

	piatto = { id_prodotto: 0, nome: "", descrizione: "", costo: 0.0, immagine: "", categoria: "", is_piatto_giorno: true };
	loading: boolean = true;

	constructor(private piattoDelGiornoService: PiattoDelGiornoService) { }

	ngOnInit() {
		this.piattoDelGiornoService.GetPiattoDelGiorno().subscribe({
			next: (response) => {
				console.log(response);
				this.piatto = response;
				this.piatto.nome = this.piatto.nome.toUpperCase();
				this.loading = false;
			},
			error: (err) => {
				this.piatto = err.message;
				this.loading = false;
			}
		})
	}

}
