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
import { HeroComponent } from 'src/app/components/hero/hero.component';
import { PiattoDelGiornoComponent } from 'src/app/components/piatto-del-giorno/piatto-del-giorno.component';
import { ListaMenuComponent } from 'src/app/components/lista-menu/lista-menu.component';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { CarrelloService } from 'src/app/core/services/carrello.service';
import { Router, RouterModule } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { ProdottoRecord } from 'src/app/core/interfaces/Prodotto';
import { OrdineService } from 'src/app/core/services/ordine.service';
import { TavoloService } from 'src/app/core/services/tavolo.service';
import { firstValueFrom } from 'rxjs';

@Component({
	selector: 'app-menu-tavolo',
	templateUrl: './menu-tavolo.page.html',
	styleUrls: ['./menu-tavolo.page.scss'],
	standalone: true,
	imports: [
		RouterModule,
		IonButton,
		IonContent,
		CommonModule,
		FormsModule,
		HeroComponent,
		PiattoDelGiornoComponent,
		ListaMenuComponent,
	],
})
export class MenuTavoloPage implements OnInit {
	nomeUtente: string = '';
	numeroTavolo: number | null = null;
	prodottiNelCarrello: ProdottoRecord[] = [];
	totale: number = 0;

	constructor(
		private servizioCarrello: CarrelloService,
		private router: Router,
		private toastController: ToastController,
		private servizioAutenticazione: AuthenticationService,
		private ordineService: OrdineService,
		private tavoloService: TavoloService
	) {}

	async checkTotale() {
		this.prodottiNelCarrello = this.servizioCarrello.getProdotti();
		this.totale = parseFloat(
			this.prodottiNelCarrello
				.reduce((acc, prodotto) => acc + prodotto.costo, 0)
				.toFixed(2)
		);
		if (this.totale == 0) {
			const toast = await this.toastController.create({
				message: 'Devi selezionare almeno un prodotto',
				duration: 3000,
				position: 'bottom',
				color: 'warning',
			});
			await toast.present();
		} else {
			const numeroTavolo = this.tavoloService.getNumeroTavolo();
			const prenotazione = this.tavoloService.getPrenotazione();

			if (prenotazione === null) {
				const toast = await this.toastController.create({
					message: 'Errore: prenotazione non trovata.',
					duration: 3000,
					position: 'bottom',
					color: 'danger',
				});
				await toast.present();
				return;
			}
			console.log(prenotazione);
			console.log(this.servizioAutenticazione.getIdUtente());
			try {
				await firstValueFrom(
					this.ordineService.addOrdine(
						"luca.gaetani.2003",
						prenotazione,
						this.servizioAutenticazione.getIdUtente()
					)
				);
			} catch (error) {
				const toast = await this.toastController.create({
					message: 'Errore: ordine non inviato',
					duration: 3000,
					position: 'bottom',
					color: 'danger',
				});
				await toast.present();
				console.error(error);
				return;
				
			}

			this.servizioCarrello.svuotaCarrello();
			this.totale = 0;
			const toast = await this.toastController.create({
				message:
					'Ordine inviato con successo, usa il pulsante "VISUALIZZA ORDINI" per visualizzare lo stato dei tuoi ordini',
				duration: 3000,
				position: 'bottom',
				color: 'success',
			});
			await toast.present();
		}
	}

	async visualizzaOrdini() {
		// Controlla se ci sono prodotti nel db ordinati NON GUARDARE IL CARRELLO------------------
		this.prodottiNelCarrello = this.servizioCarrello.getProdotti();
		this.totale = parseFloat(
			this.prodottiNelCarrello
				.reduce((acc, prodotto) => acc + prodotto.costo, 0)
				.toFixed(2)
		);
		if (this.totale == 0) {
			const toast = await this.toastController.create({
				message: 'Non hai ancora effettuato ordini',
				duration: 3000,
				position: 'bottom',
				color: 'warning',
			});
			await toast.present();
		} else {
			this.router.navigate(['/visualizza-ordini']);
		}
	}
	ngOnInit() {
		this.ngViewWillEnter();
	}

	ngViewWillEnter() {
		this.nomeUtente = this.servizioAutenticazione.getUsername();
		this.numeroTavolo = this.tavoloService.getNumeroTavolo();
	}
}
