import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
	IonContent,
	IonRow,
	IonCol,
	IonButton,
} from '@ionic/angular/standalone';
import { OrdProdEstended } from 'src/app/core/interfaces/OrdProd';
import { ListaOrdiniComponent } from 'src/app/components/lista-ordini/lista-ordini.component';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Tavolo, TavoloService } from 'src/app/core/services/tavolo.service';
import { OrdineService } from 'src/app/core/services/ordine.service';

@Component({
	selector: 'app-visualizza-ordini-cameriere',
	templateUrl: './visualizza-ordini-cameriere.page.html',
	styleUrls: ['./visualizza-ordini-cameriere.page.scss'],
	standalone: true,
	imports: [
		IonButton,
		IonCol,
		IonRow,
		IonContent,
		CommonModule,
		FormsModule,
		ListaOrdiniComponent,
	],
})
export class VisualizzaOrdiniCamerierePage implements OnInit {
	//prodotti: OrdProdEstended[] = [];
	//DA CANCELLARE SOTTO SERVE SOLO PER LE PROVE FIN QUANDO NON CI SONO LE ROTTE
	private prodottiSubject = new BehaviorSubject<OrdProdEstended[]>([
		{
			id_prodotto: 1,
			nome: 'Pizza Margherita',
			descrizione: 'Pomodoro, mozzarella, basilico',
			costo: 7.5,
			immagine: 'margherita.jpg',
			categoria: 'Pizza',
			is_piatto_giorno: false,
			id_ord_prod: 201,
			is_romana: true,
			stato: 'non-in-lavorazione',
		},
		{
			id_prodotto: 2,
			nome: 'Lasagna',
			descrizione: 'Ragù, besciamella e pasta fresca',
			costo: 9.0,
			immagine: 'lasagna.jpg',
			categoria: 'Primi',
			is_piatto_giorno: true,
			id_ord_prod: 202,
			is_romana: false,
			stato: 'in-lavorazione',
		},
		{
			id_prodotto: 3,
			nome: 'Tiramisù',
			descrizione: 'Mascarpone, savoiardi e caffè',
			costo: 4.5,
			immagine: 'tiramisu.jpg',
			categoria: 'Dolci',
			is_piatto_giorno: false,
			id_ord_prod: 203,
			is_romana: false,
			stato: 'in-consegna',
		},
		{
			id_prodotto: 4,
			nome: 'Pizza Diavola',
			descrizione: 'Mozzarella e salame piccante',
			costo: 8.0,
			immagine: 'diavola.jpg',
			categoria: 'Pizza',
			is_piatto_giorno: true,
			id_ord_prod: 204,
			is_romana: true,
			stato: 'consegnato',
		},
		{
			id_prodotto: 5,
			nome: 'Risotto ai Funghi',
			descrizione: 'Riso carnaroli e funghi porcini',
			costo: 8.5,
			immagine: 'risotto_funghi.jpg',
			categoria: 'Primi',
			is_piatto_giorno: false,
			id_ord_prod: 205,
			is_romana: false,
			stato: 'non-in-lavorazione',
		},
		{
			id_prodotto: 6,
			nome: 'Panna Cotta',
			descrizione: 'Panna, zucchero, vaniglia',
			costo: 3.5,
			immagine: 'pannacotta.jpg',
			categoria: 'Dolci',
			is_piatto_giorno: false,
			id_ord_prod: 206,
			is_romana: false,
			stato: 'in-lavorazione',
		},
		{
			id_prodotto: 7,
			nome: 'Pizza Quattro Formaggi',
			descrizione: 'Mozzarella, gorgonzola, fontina, parmigiano',
			costo: 9.0,
			immagine: '4formaggi.jpg',
			categoria: 'Pizza',
			is_piatto_giorno: false,
			id_ord_prod: 207,
			is_romana: true,
			stato: 'in-consegna',
		},
		{
			id_prodotto: 8,
			nome: 'Gnocchi al Pesto',
			descrizione: 'Gnocchi di patate con pesto genovese',
			costo: 7.5,
			immagine: 'gnocchi_pesto.jpg',
			categoria: 'Primi',
			is_piatto_giorno: true,
			id_ord_prod: 208,
			is_romana: false,
			stato: 'consegnato',
		},
		{
			id_prodotto: 9,
			nome: 'Torta della Nonna',
			descrizione: 'Crema pasticcera e pinoli',
			costo: 4.0,
			immagine: 'torta_nonna.jpg',
			categoria: 'Dolci',
			is_piatto_giorno: false,
			id_ord_prod: 209,
			is_romana: true,
			stato: 'in-lavorazione',
		},
		{
			id_prodotto: 10,
			nome: 'Pizza Capricciosa',
			descrizione: 'Prosciutto, funghi, carciofi, olive',
			costo: 9.5,
			immagine: 'capricciosa.jpg',
			categoria: 'Pizza',
			is_piatto_giorno: true,
			id_ord_prod: 210,
			is_romana: true,
			stato: 'non-in-lavorazione',
		},
		{
			id_prodotto: 11,
			nome: 'Spaghetti alla Carbonara',
			descrizione: 'Uova, guanciale, pecorino',
			costo: 8.5,
			immagine: 'carbonara.jpg',
			categoria: 'Primi',
			is_piatto_giorno: true,
			id_ord_prod: 211,
			is_romana: true,
			stato: 'in-consegna',
		},
		{
			id_prodotto: 12,
			nome: 'Cannoli Siciliani',
			descrizione: 'Ricotta dolce e scorza d’arancia',
			costo: 3.8,
			immagine: 'cannoli.jpg',
			categoria: 'Dolci',
			is_piatto_giorno: false,
			id_ord_prod: 212,
			is_romana: false,
			stato: 'consegnato',
		},
		{
			id_prodotto: 13,
			nome: 'Pizza Ortolana',
			descrizione: 'Verdure grigliate e mozzarella',
			costo: 8.2,
			immagine: 'ortolana.jpg',
			categoria: 'Pizza',
			is_piatto_giorno: false,
			id_ord_prod: 213,
			is_romana: true,
			stato: 'in-lavorazione',
		},
		{
			id_prodotto: 14,
			nome: 'Ravioli Ricotta e Spinaci',
			descrizione: 'Con burro e salvia',
			costo: 7.8,
			immagine: 'ravioli.jpg',
			categoria: 'Primi',
			is_piatto_giorno: true,
			id_ord_prod: 214,
			is_romana: false,
			stato: 'non-in-lavorazione',
		},
		{
			id_prodotto: 15,
			nome: 'Semifreddo al Torroncino',
			descrizione: 'Delicato semifreddo con torroncino',
			costo: 4.2,
			immagine: 'semifreddo.jpg',
			categoria: 'Dolci',
			is_piatto_giorno: false,
			id_ord_prod: 215,
			is_romana: false,
			stato: 'consegnato',
		},
		{
			id_prodotto: 16,
			nome: 'Pizza Bufalina',
			descrizione: 'Mozzarella di bufala e basilico',
			costo: 9.0,
			immagine: 'bufalina.jpg',
			categoria: 'Pizza',
			is_piatto_giorno: true,
			id_ord_prod: 216,
			is_romana: true,
			stato: 'in-lavorazione',
		},
		{
			id_prodotto: 17,
			nome: 'Tagliatelle al Ragù',
			descrizione: 'Con ragù alla bolognese',
			costo: 8.7,
			immagine: 'tagliatelle.jpg',
			categoria: 'Primi',
			is_piatto_giorno: false,
			id_ord_prod: 217,
			is_romana: false,
			stato: 'in-consegna',
		},
		{
			id_prodotto: 18,
			nome: 'Zuppa Inglese',
			descrizione: 'Pan di Spagna, crema e alchermes',
			costo: 3.9,
			immagine: 'zuppa_inglese.jpg',
			categoria: 'Dolci',
			is_piatto_giorno: false,
			id_ord_prod: 218,
			is_romana: false,
			stato: 'non-in-lavorazione',
		},
		{
			id_prodotto: 19,
			nome: 'Pizza Boscaiola',
			descrizione: 'Salsiccia e funghi',
			costo: 9.3,
			immagine: 'boscaiola.jpg',
			categoria: 'Pizza',
			is_piatto_giorno: true,
			id_ord_prod: 219,
			is_romana: true,
			stato: 'in-lavorazione',
		},
		{
			id_prodotto: 20,
			nome: 'Paccheri al Sugo di Mare',
			descrizione: 'Paccheri con frutti di mare',
			costo: 10.0,
			immagine: 'paccheri.jpg',
			categoria: 'Primi',
			is_piatto_giorno: false,
			id_ord_prod: 220,
			is_romana: false,
			stato: 'consegnato',
		},
	]);
	public prodotti$ = this.prodottiSubject.asObservable();


	tavolo: Tavolo | null = null;
	constructor(
    private tavoloService: TavoloService,
	private ordineService: OrdineService
  ) {}

	ngOnInit() {
    this.tavolo = this.tavoloService.getTavolo();
  }

	consegnaTutto() {
		const prodottiList = this.prodottiSubject.getValue();
		const nuoviProdotti = prodottiList.map((prodotto) => {
			if (prodotto.stato === 'in-consegna') {
				return { ...prodotto, stato: 'consegnato' };
			}
			return prodotto;
		});
		this.prodottiSubject.next(nuoviProdotti);
	}
}
