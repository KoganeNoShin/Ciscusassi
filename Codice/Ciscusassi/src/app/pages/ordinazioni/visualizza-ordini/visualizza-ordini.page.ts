import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
	IonContent,
	IonHeader,
	IonTitle,
	IonToolbar,
	IonButton,
	IonSpinner,
	IonText,
} from '@ionic/angular/standalone';
import { CarrelloService } from 'src/app/core/services/carrello.service';
import { OrdProdEstended } from 'src/app/core/interfaces/OrdProd';
import { Router, RouterModule } from '@angular/router';
import { ProdottoOrdineComponent } from 'src/app/components/prodotto-ordine/prodotto-ordine.component';
import { ListaOrdiniComponent } from '../../../components/lista-ordini/lista-ordini.component';
import { Observable, of, firstValueFrom } from 'rxjs';
import { OrdineService } from 'src/app/core/services/ordine.service';
import { TavoloService } from 'src/app/core/services/tavolo.service';
import { ToastController } from '@ionic/angular';

@Component({
	selector: 'app-visualizza-ordini',
	templateUrl: './visualizza-ordini.page.html',
	styleUrls: ['./visualizza-ordini.page.scss'],
	imports: [
		RouterModule,
		IonButton,
		IonContent,
		IonSpinner,
		CommonModule,
		FormsModule,
		ListaOrdiniComponent,
		IonText,
	],
})
export class VisualizzaOrdiniPage implements OnInit {
	// Variabile per memorizzare l'interval che aggiorna gli ordini
	private intervalAggiornamento: any;

	// Observable di array di prodotti ordinati, inizialmente vuoto
	prodotti$: Observable<OrdProdEstended[]> = of([]);

	// Variabile per mostrare il caricamento
	isLoading = false;

	// Iniezione di dipendenze: router, servizio ordini e servizio tavolo
	constructor(
		private router: Router,
		private ordineService: OrdineService,
		private tavoloService: TavoloService,
		private toastController: ToastController
	) {}

	// Metodo per terminare il servizio e passare al pagamento
	terminaServizio() {
		let count = 0;
		this.prodotti$.subscribe((prodotti) => {
			for (const prodotto of prodotti) {
				if (prodotto.stato != 'consegnato') {
					count++;
				}
			}

			if (count == 0) {
				this.prodotti$.subscribe((prodottiArray) => {
					this.tavoloService.setOrdini(prodottiArray);
				});
				this.router.navigate(['/pagamento-tavolo']); // Naviga alla pagina di pagamento tavolo
			} else {
				this.toastController
					.create({
						message:
							'Per procedere al pagamento tutti i prodotti devono essere stati consegnati',
						duration: 2000,
						color: 'warning',
					})
					.then((toast) => toast.present());
			}
		});
	}

	// Metodo lifecycle Angular chiamato all'inizializzazione del componente
	ngOnInit() {
		this.ngViewWillEnter(); // Chiama la funzione per caricare gli ordini e impostare aggiornamenti
	}

	// Metodo personalizzato per caricare dati e impostare aggiornamenti periodici
	ngViewWillEnter() {
		this.loadOrdini(); // Carica gli ordini inizialmente

		// Imposta un intervallo che ricarica gli ordini ogni 30 secondi
		this.intervalAggiornamento = setInterval(() => this.loadOrdini(), 5000);
	}

	// Metodo lifecycle Angular chiamato prima che il componente venga distrutto
	ngOnDestroy() {
		this.ionViewWillLeave(); // Chiama il metodo per pulire l'intervallo di aggiornamento
	}

	ionViewWillLeave() {
		// Cancella l'intervallo di aggiornamento quando il componente sta per essere abbandonato
		if (this.intervalAggiornamento) {
			clearInterval(this.intervalAggiornamento);
		}
	}

	// Metodo asincrono per caricare gli ordini dal backend
	async loadOrdini() {
		this.isLoading = true;
		try {
			const numeroOrdine = this.tavoloService.getNumeroOrdine();
			if (numeroOrdine === null) {
				console.error('Numero ordine non disponibile');
				this.prodotti$ = of([]);
				return;
			}

			const response = await firstValueFrom(
				this.ordineService.getProdottiOrdinatiByNumeroOrdine(
					numeroOrdine
				)
			);

			if (!response.success || !response.data) {
				this.prodotti$ = of([]);
			} else {
				const prodotti = Array.isArray(response.data)
					? response.data.filter(
							(item): item is OrdProdEstended => !!item
						)
					: [response.data];
				this.prodotti$ = of(prodotti);
			}
		} catch (error) {
			console.error('Errore nel caricamento prodotti', error);
			this.prodotti$ = of([]);
		} finally {
			this.isLoading = false;
		}
	}
}
