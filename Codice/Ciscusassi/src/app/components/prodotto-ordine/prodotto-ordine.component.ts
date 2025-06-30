import {
	Component,
	OnInit,
	OnDestroy,
	Input,
	OnChanges,
	SimpleChanges,
} from '@angular/core';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { IonButton, IonCheckbox, IonItem } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { OrdProdEstended } from 'src/app/core/interfaces/OrdProd';
import { Subscription } from 'rxjs';
import { OrdineService } from 'src/app/core/services/ordine.service';

@Component({
	selector: 'app-prodotto-ordine',
	templateUrl: './prodotto-ordine.component.html',
	styleUrls: ['./prodotto-ordine.component.scss'],
	standalone: true,
	imports: [IonCheckbox, IonButton, CommonModule],
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
}
