import {
	Component,
	OnInit,
	OnDestroy,
	Input,
	OnChanges,
	SimpleChanges,
} from '@angular/core';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { IonButton, IonCheckbox, IonText } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { OrdProdEstended } from 'src/app/core/interfaces/OrdProd';
import { Subscription } from 'rxjs';
import { OrdineService } from 'src/app/core/services/ordine.service';

/**
 * Questo componente viene utilizando quando l'utente sta sfogliando le proprie ordinazioni,
 * oppure quando lo chef o il cameriere devono visualizzare le comande di un determinato tavolo.
 *
 * Permette agli utenti di visualizzare lo stato di un piatto, e qualora ne avessero i poteri (chef e cameriere), di cambiare stato.
 *
 * @input prodotto - Oggetto di tipo {@link OrdProdEstended} che ci permette di definire un prodotto e le sue caratteristiche.
 */
@Component({
	selector: 'app-prodotto-ordine',
	templateUrl: './prodotto-ordine.component.html',
	styleUrls: ['./prodotto-ordine.component.scss'],
	standalone: true,
	imports: [IonText, IonCheckbox, IonButton, CommonModule],
})
export class ProdottoOrdineComponent implements OnInit, OnDestroy, OnChanges {
	private authSub!: Subscription;

	@Input() prodotto!: OrdProdEstended;

	ruolo: string = '';
	statoPiatto: string = '';

	constructor(
		private servizioAutenticazione: AuthenticationService,
		private ordineService: OrdineService
	) {}

	ngOnInit() {
		this.authSub = this.servizioAutenticazione.role$.subscribe((ruolo) => {
			this.ruolo = ruolo;
		});
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes['prodotto'] && changes['prodotto'].currentValue) {
			this.statoPiatto = changes['prodotto'].currentValue.stato;
		}
	}

	ngOnDestroy() {
		if (this.authSub) {
			this.authSub.unsubscribe();
		}
	}

	iniziaLavorazione() {
		this.ordineService
			.cambiaStato('in-lavorazione', this.prodotto.id_ord_prod)
			.subscribe();
		this.statoPiatto = 'in-lavorazione';
	}

	fineLavorazione() {
		this.ordineService
			.cambiaStato('in-consegna', this.prodotto.id_ord_prod)
			.subscribe();
		this.statoPiatto = 'in-consegna';
	}

	consegna() {
		this.ordineService
			.cambiaStato('consegnato', this.prodotto.id_ord_prod)
			.subscribe();
		this.statoPiatto = 'consegnato';
	}

	cestina() {
		this.ordineService
			.cambiaStato('non-in-lavorazione', this.prodotto.id_ord_prod)
			.subscribe();
		this.statoPiatto = 'non-in-lavorazione';
	}

	cambiaRomana() {
		const nuovoValore = !this.prodotto.is_romana;

		this.ordineService
			.cambiaRomana(this.prodotto.id_ord_prod, nuovoValore)
			.subscribe({
				next: () => {
					this.prodotto.is_romana = nuovoValore;
				},
				error: (err) => {
					console.error('Errore nel cambiare romana:', err);
				},
			});
	}
}
