import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ProdottoRecord } from 'src/app/core/interfaces/Prodotto';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { IonButton } from '@ionic/angular/standalone';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-prodotto-ordine',
	templateUrl: './prodotto-ordine.component.html',
	styleUrls: ['./prodotto-ordine.component.scss'],
	imports: [IonButton, CommonModule],
	standalone: true,
})
export class ProdottoOrdineComponent implements OnInit, OnDestroy {
	@Input() prodotto!: ProdottoRecord;
	ruolo: string = '';
	statoPiatto: string = '';

	constructor(private servizioAutenticazione: AuthenticationService) {}

	ngOnInit() {
		this.servizioAutenticazione.role$.subscribe((ruolo) => {
			this.ruolo = ruolo;
		});
    if(this.ruolo == "cliente" || this.ruolo == "chef"){
      this.statoPiatto = "non-in-lavorazione";
    } else if(this.ruolo == "cameriere"){
      this.statoPiatto = "in-consegna";
    }
	}
	ngOnDestroy(): void {}

  iniziaLavorazione(){
    this.statoPiatto = "in-lavorazione";
  }

  fineLavorazione(){
    this.statoPiatto = "in-consegna";
  }

  consegna(){
    this.statoPiatto = "consegnato";
  }

  cestina(){
    this.statoPiatto = "non-in-lavorazione";
  }
}
