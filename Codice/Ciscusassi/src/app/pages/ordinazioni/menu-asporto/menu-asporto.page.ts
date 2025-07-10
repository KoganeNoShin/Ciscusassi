import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
	IonContent,
	IonHeader,
	IonTitle,
	IonToolbar,
	IonButton,
} from '@ionic/angular/standalone';
import { Router, RouterModule } from '@angular/router';
import { ToastController } from '@ionic/angular/standalone';
import { CarrelloService } from 'src/app/core/services/carrello.service';
import { ProdottoRecord } from 'src/app/core/interfaces/Prodotto';
import { HeroComponent } from 'src/app/components/hero/hero.component';
import { PiattoDelGiornoComponent } from 'src/app/components/piatto-del-giorno/piatto-del-giorno.component';
import { ListaMenuComponent } from 'src/app/components/lista-menu/lista-menu.component';
import { AuthenticationService } from 'src/app/core/services/authentication.service';

/**
 * Pagina di ordinazione da asporto, permette al cliente di visionare
 * tutti i prodotti ed eventualmente aggiungerli o rimuoverli dal carrello.
 */
@Component({
	selector: 'app-menu-asporto',
	templateUrl: './menu-asporto.page.html',
	styleUrls: ['./menu-asporto.page.scss'],
	standalone: true,
	imports: [
		IonContent,
		CommonModule,
		FormsModule,
		HeroComponent,
		PiattoDelGiornoComponent,
		ListaMenuComponent,
		IonButton,
		RouterModule,
	],
})
export class MenuAsportoPage implements OnInit {
	nomeUtente: string = '';
	prodottiNelCarrello: ProdottoRecord[] = [];
	totale: number = 0;

	constructor(
		private servizioCarrello: CarrelloService,
		private router: Router,
		private toastController: ToastController,
		private servizioAutenticazione: AuthenticationService
	) {}

	/** Funzione per controllare se ci sono abbastanza prodotti per arrivare ad un minimo di 30€ */
	async checkTotale() {
		this.prodottiNelCarrello = this.servizioCarrello.getProdotti();
		this.totale = parseFloat(
			this.prodottiNelCarrello
				.reduce((acc, prodotto) => acc + prodotto.costo, 0)
				.toFixed(2)
		);
		if (this.totale <= 30) {
			const toast = await this.toastController.create({
				message: 'Possiamo consegnare solo ordini superiori a 30€',
				duration: 3000,
				position: 'bottom',
				color: 'warning',
			});
			await toast.present();
		} else {
			this.router.navigateByUrl('/pagamento-asporto', { replaceUrl: true });
		}
	}

	ngOnInit() {
		this.nomeUtente = this.servizioAutenticazione.getUsername();
	}
}
