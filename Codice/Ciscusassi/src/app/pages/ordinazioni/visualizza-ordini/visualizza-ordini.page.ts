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
import { CarrelloService } from 'src/app/core/services/carrello.service';
import { OrdProdEstended } from 'src/app/core/interfaces/OrdProd';
import { Router, RouterModule } from '@angular/router';
import { ProdottoOrdineComponent } from 'src/app/components/prodotto-ordine/prodotto-ordine.component';
import { ListaOrdiniComponent } from '../../../components/lista-ordini/lista-ordini.component';
import { Observable, of, firstValueFrom } from 'rxjs';
import { OrdineService } from 'src/app/core/services/ordine.service';
import { TavoloService } from 'src/app/core/services/tavolo.service';

@Component({
	selector: 'app-visualizza-ordini',
	templateUrl: './visualizza-ordini.page.html',
	styleUrls: ['./visualizza-ordini.page.scss'],
	imports: [
		RouterModule,
		IonButton,
		IonContent,
		CommonModule,
		FormsModule,
		ListaOrdiniComponent,
	],
})
export class VisualizzaOrdiniPage implements OnInit {
	// Variabile per memorizzare l'interval che aggiorna gli ordini
	private intervalAggiornamento: any;

	// Observable di array di prodotti ordinati, inizialmente vuoto
	prodotti$: Observable<OrdProdEstended[]> = of([]);

	// Iniezione di dipendenze: router, servizio ordini e servizio tavolo
	constructor(
		private router: Router,
		private ordineService: OrdineService,
		private tavoloService: TavoloService
	) {}

	// Metodo per terminare il servizio e passare al pagamento
	terminaServizio() {
		// TODO: implementare logica che verifica se tutti i prodotti sono stati consegnati,
		// altrimenti mostrare messaggio di errore con toast
		this.router.navigate(['/pagamento-tavolo']); // Naviga alla pagina di pagamento tavolo
	}

	// Metodo lifecycle Angular chiamato all'inizializzazione del componente
	ngOnInit() {
		this.ngViewWillEnter(); // Chiama la funzione per caricare gli ordini e impostare aggiornamenti
	}

	// Metodo personalizzato per caricare dati e impostare aggiornamenti periodici
	ngViewWillEnter() {
		this.loadOrdini(); // Carica gli ordini inizialmente

		// Imposta un intervallo che ricarica gli ordini ogni 30 secondi
		this.intervalAggiornamento = setInterval(
			() => this.loadOrdini(),
			30000
		);
	}

	// Metodo lifecycle Angular chiamato prima che il componente venga distrutto
	ngOnDestroy() {
		// Se esiste un intervallo di aggiornamento, lo cancella per evitare memory leak
		if (this.intervalAggiornamento) {
			clearInterval(this.intervalAggiornamento);
		}
	}

	// Metodo asincrono per caricare gli ordini dal backend
	async loadOrdini() {
		// Ottiene il numero ordine dal servizio tavolo
		const numeroOrdine = this.tavoloService.getNumeroOrdine();

		// Se il numero ordine non è disponibile, stampa errore e termina
		if (numeroOrdine === null) {
			console.error('Numero ordine non disponibile');
			return;
		}

		// Effettua la chiamata al servizio ordini per ottenere i prodotti ordinati
		const response = await firstValueFrom(
			this.ordineService.getProdottiOrdinatiByNumeroOrdine(numeroOrdine)
		);

		// Se la risposta non ha successo o dati, imposta l'observable prodotti$ a vuoto
		if (!response.success || !response.data) {
			this.prodotti$ = of([]);
		} else {
			// Se la risposta contiene un array di prodotti, filtra gli elementi validi
			// Altrimenti, se è un singolo prodotto, lo incapsula in un array
			const prodotti = Array.isArray(response.data)
				? response.data.filter(
						(item): item is OrdProdEstended => !!item
					)
				: [response.data];

			// Aggiorna l'observable prodotti$ con i prodotti ottenuti
			this.prodotti$ = of(prodotti);
		}
	}
}
