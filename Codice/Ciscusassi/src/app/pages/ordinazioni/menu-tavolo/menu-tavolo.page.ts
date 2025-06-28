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
import { OrdProdEstended } from 'src/app/core/interfaces/OrdProd';

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
	prodottiOrdinati: OrdProdEstended[] = [];
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
			try {
				//IL CONTROLLO SE HA ORDINATO BISOGNA CONTROLLARE IL DB//
				if (!this.tavoloService.getHaOrdinato()) {
					const ordineResponse = await firstValueFrom(
						this.ordineService.addOrdine(
							'luca.gaetani.2003',
							prenotazione,
							this.servizioAutenticazione.getIdUtente()
						)
					);
					this.tavoloService.setNumeroOrdine(12); //VA IMPOSTATO IL NUMERO ORDINE TRAMITE DB
					this.tavoloService.setHaOrdinato(true);
				}
			} catch (error) {
				const toast = await this.toastController.create({
					message: "Errore: l'ordine non è stato creato",
					duration: 3000,
					position: 'bottom',
					color: 'danger',
				});
				await toast.present();
				console.error(error);
				return;
			}

			try {
				await firstValueFrom(
					this.ordineService.ordineAddProdotti(
						prenotazione,
						this.servizioCarrello.getProdotti()
					)
				);
			} catch (error) {
				const toast = await this.toastController.create({
					message:
						"Errore: L'ordine è stato creato ma i prodotti non sono stati aggiunti",
					duration: 3000,
					position: 'bottom',
					color: 'danger',
				});
				console.log(this.servizioCarrello.getProdotti());
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
		try {
			const numeroOrdine = this.tavoloService.getNumeroOrdine();
			if (numeroOrdine === null) {
				const toast = await this.toastController.create({
					message: 'Errore: numero ordine non disponibile.',
					duration: 3000,
					position: 'bottom',
					color: 'danger',
				});
				await toast.present();
				return;
			}

			const response = await firstValueFrom(
				this.ordineService.getProdottiOrdinatiByNumeroOrdine(
					numeroOrdine
				)
			);

			if (
				!response.success ||
				!response.data
			) {
				const toast = await this.toastController.create({
					message: 'Non hai ancora effettuato ordini',
					duration: 3000,
					position: 'bottom',
					color: 'warning',
				});
				await toast.present();
				return;
			}
			
			if (this.tavoloService.getHaOrdinato()){
				this.router.navigate(['/visualizza-ordini']);
			}
		} catch (error) {
			const toast = await this.toastController.create({
				message: 'Errore nel recupero degli ordini.',
				duration: 3000,
				position: 'bottom',
				color: 'danger',
			});
			await toast.present();
			console.error(error);
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
