// Importazioni di base di Angular e moduli Ionic standalone
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

// Componenti personalizzati importati nella pagina
import { HeroComponent } from 'src/app/components/hero/hero.component';
import { PiattoDelGiornoComponent } from 'src/app/components/piatto-del-giorno/piatto-del-giorno.component';
import { ListaMenuComponent } from 'src/app/components/lista-menu/lista-menu.component';

// Servizi per gestione autenticazione, carrello, ordine e tavolo
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { CarrelloService } from 'src/app/core/services/carrello.service';
import { Router, RouterModule } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { ProdottoRecord } from 'src/app/core/interfaces/Prodotto';
import { OrdineService } from 'src/app/core/services/ordine.service';
import { TavoloService } from 'src/app/core/services/tavolo.service';
import { firstValueFrom } from 'rxjs';
import { OrdProdEstended, OrdProdInput } from 'src/app/core/interfaces/OrdProd';

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
	// Nome dell’utente loggato
	nomeUtente: string = '';
	// Numero del tavolo a cui è associato l’utente
	numeroTavolo: number | null = null;
	// Lista dei prodotti selezionati nel carrello
	prodottiNelCarrello: ProdottoRecord[] = [];
	// Prodotti già ordinati e recuperati
	prodottiOrdinati: OrdProdEstended[] = [];
	// Totale dell’importo nel carrello
	totale: number = 0;

	constructor(
		private servizioCarrello: CarrelloService,
		private router: Router,
		private toastController: ToastController,
		private servizioAutenticazione: AuthenticationService,
		private ordineService: OrdineService,
		private tavoloService: TavoloService
	) {}

	// Metodo chiamato per verificare e inviare l'ordine
	async checkTotale() {
		// Recupera prodotti dal carrello e calcola il totale
		this.prodottiNelCarrello = this.servizioCarrello.getProdotti();
		this.totale = parseFloat(
			this.prodottiNelCarrello
				.reduce((acc, prodotto) => acc + prodotto.costo, 0)
				.toFixed(2)
		);

		// Controllo se il carrello è vuoto
		if (this.totale == 0) {
			const toast = await this.toastController.create({
				message: 'Devi selezionare almeno un prodotto',
				duration: 3000,
				position: 'bottom',
				color: 'warning',
			});
			await toast.present();
		} else {
			// Recupera la prenotazione associata al tavolo
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
				// Se l’ordine non è stato ancora effettuato, lo crea
				if (!this.tavoloService.getHaOrdinato()) {
					const ordineResponse = await firstValueFrom(
						this.ordineService.addOrdine(
							this.servizioAutenticazione.getUsername(),
							prenotazione,
							this.servizioAutenticazione.getIdUtente()
						)
					);
					this.tavoloService.setNumeroOrdine(
						ordineResponse.data.id_ordine
					);
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
				// Recupera il numero ordine dopo la creazione
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

				// Costruisce l’array dei prodotti da ordinare
				const ordProdInputArray: OrdProdInput[] = this.servizioCarrello
					.getProdotti()
					.map((prodotto) => ({
						is_romana: false,
						stato: 'non-in-lavorazione',
						ref_prodotto: prodotto.id_prodotto,
						ref_ordine: numeroOrdine,
					}));

				// Invio dei prodotti all’ordine
				await firstValueFrom(
					this.ordineService.ordineAddProdotti(ordProdInputArray)
				);
			} catch (error) {
				const toast = await this.toastController.create({
					message:
						"Errore: L'ordine è stato creato ma i prodotti non sono stati aggiunti",
					duration: 3000,
					position: 'bottom',
					color: 'danger',
				});
				await toast.present();
				console.error(error);
				return;
			}

			// Reset del carrello e notifica di successo
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

	// Metodo per visualizzare gli ordini associati al tavolo
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

			// Recupero dei prodotti già ordinati per il numero ordine
			const response = await firstValueFrom(
				this.ordineService.getProdottiOrdinatiByNumeroOrdine(
					numeroOrdine
				)
			);

			if (!response.success || !response.data) {
				const toast = await this.toastController.create({
					message: 'Non hai ancora effettuato ordini',
					duration: 3000,
					position: 'bottom',
					color: 'warning',
				});
				await toast.present();
				return;
			}

			// Se ha ordinato, reindirizza alla pagina visualizza ordini
			if (this.tavoloService.getHaOrdinato()) {
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

	// Lifecycle hook Angular, chiamato all'inizializzazione
	ngOnInit() {
		this.ngViewWillEnter();
	}

	// Metodo chiamato alla visualizzazione del componente (simula ionViewWillEnter)
	ngViewWillEnter() {
		this.nomeUtente = this.servizioAutenticazione.getUsername();
		this.numeroTavolo = this.tavoloService.getNumeroTavolo();
	}
}
