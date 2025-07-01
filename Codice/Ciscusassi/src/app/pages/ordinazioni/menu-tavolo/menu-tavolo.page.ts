import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
	IonContent,
	IonHeader,
	IonTitle,
	IonToolbar,
	IonButton,
	ToastController,
} from '@ionic/angular/standalone';

import { HeroComponent } from 'src/app/components/hero/hero.component';
import { PiattoDelGiornoComponent } from 'src/app/components/piatto-del-giorno/piatto-del-giorno.component';
import { ListaMenuComponent } from 'src/app/components/lista-menu/lista-menu.component';

import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { CarrelloService } from 'src/app/core/services/carrello.service';
import { Router, RouterModule } from '@angular/router';
import { ProdottoRecord } from 'src/app/core/interfaces/Prodotto';
import { OrdineService } from 'src/app/core/services/ordine.service';
import { TavoloService } from 'src/app/core/services/tavolo.service';
import { firstValueFrom } from 'rxjs';
import { OrdProdInput } from 'src/app/core/interfaces/OrdProd';

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
	numeroOrdine: number = 0; // variabile locale per il numero ordine

	constructor(
		private servizioCarrello: CarrelloService,
		private router: Router,
		private toastController: ToastController,
		private servizioAutenticazione: AuthenticationService,
		private ordineService: OrdineService,
		private tavoloService: TavoloService
	) {}

	ngOnInit() {
		this.ngViewWillEnter();
	}

	async ngViewWillEnter() {
		this.nomeUtente = this.servizioAutenticazione.getUsername();
		this.numeroTavolo = this.tavoloService.getNumeroTavolo();
		this.numeroOrdine = 0;
		this.tavoloService.setNumeroOrdine(0);

		const prenotazione = this.tavoloService.getPrenotazione();

		if (prenotazione !== null) {
			try {
				const response = await firstValueFrom(
					this.ordineService.getProdottiOrdinatiByUsername(
						prenotazione,
						this.nomeUtente
					)
				);
				if (response?.data?.id_ordine) {
					this.numeroOrdine = response.data.id_ordine;
					this.tavoloService.setNumeroOrdine(response.data.id_ordine);
				} else {
					this.numeroOrdine = 0;
					this.tavoloService.setNumeroOrdine(0);
				}
			} catch (error) {
				console.error('Errore nel recupero del numero ordine:', error);
				this.numeroOrdine = 0;
				this.tavoloService.setNumeroOrdine(0);
			}
		}
	}

	async checkTotale() {
		this.prodottiNelCarrello = this.servizioCarrello.getProdotti();
		this.totale = parseFloat(
			this.prodottiNelCarrello
				.reduce((acc, p) => acc + p.costo, 0)
				.toFixed(2)
		);

		if (this.totale === 0) {
			return this.mostraToast(
				'Devi selezionare almeno un prodotto',
				'warning'
			);
		}

		const prenotazione = this.tavoloService.getPrenotazione();
		if (!prenotazione) {
			return this.mostraToast(
				'Errore: prenotazione non trovata.',
				'danger'
			);
		}

		if (this.numeroOrdine === 0) {
			// Creo un nuovo ordine
			try {
				const ordineResponse = await firstValueFrom(
					this.ordineService.addOrdine(
						this.nomeUtente,
						prenotazione
					)
				);
				this.numeroOrdine = ordineResponse.data.id_ordine;
				this.tavoloService.setNumeroOrdine(ordineResponse.data.id_ordine);
			} catch (error) {
				console.error(error);
				return this.mostraToast(
					"Errore: l'ordine non è stato creato",
					'danger'
				);
			}
		}

		if (this.numeroOrdine === 0) {
			return this.mostraToast(
				'Non hai ancora effettuato ordini!',
				'warning'
			);
		}

		// Preparo i prodotti da inviare
		const ordProdInputArray: OrdProdInput[] = this.prodottiNelCarrello.map(
			(prodotto) => ({
				is_romana: false,
				stato: 'non-in-lavorazione',
				ref_prodotto: prodotto.id_prodotto,
				ref_ordine: this.numeroOrdine,
			})
		);

		// Invio prodotti all'ordine
		try {
			await firstValueFrom(
				this.ordineService.ordineAddProdotti(ordProdInputArray)
			);
		} catch (error) {
			console.error(error);
			return this.mostraToast(
				"Errore: prodotti non aggiunti all'ordine",
				'danger'
			);
		}

		// Reset carrello e totale
		this.servizioCarrello.svuotaCarrello();
		this.totale = 0;

		return this.mostraToast(
			'Ordine inviato con successo. Premi "VISUALIZZA ORDINI" per lo stato.',
			'success'
		);
	}

	async visualizzaOrdini() {
		if (this.numeroOrdine === 0) {
			return this.mostraToast(
				'Non hai ancora effettuato ordini!',
				'warning'
			);
		}

		try {
			const response = await firstValueFrom(
				this.ordineService.getProdottiOrdinatiByNumeroOrdine(
					this.numeroOrdine
				)
			);

			if (!response.success || !response.data) {
				return this.mostraToast(
					'Non hai ancora effettuato ordini',
					'warning'
				);
			}

			this.router.navigate(['/visualizza-ordini']);
		} catch (error) {
			console.error(error);
			return this.mostraToast(
				'Errore nel recupero degli ordini.',
				'danger'
			);
		}
	}

	private async mostraToast(
		messaggio: string,
		colore: 'success' | 'warning' | 'danger'
	) {
		const toast = await this.toastController.create({
			message: messaggio,
			duration: 3000,
			position: 'bottom',
			color: colore,
		});
		await toast.present();
	}
}
