import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { IonButton } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { OrdProdEstended } from 'src/app/core/interfaces/OrdProd';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-prodotto-ordine',
  templateUrl: './prodotto-ordine.component.html',
  styleUrls: ['./prodotto-ordine.component.scss'],
  standalone: true,
  imports: [IonButton, CommonModule],
})
export class ProdottoOrdineComponent implements OnInit, OnDestroy, OnChanges {
  private authSub!: Subscription;

  @Input() prodotto!: OrdProdEstended;

  ruolo: string = '';
  statoPiatto: string = '';

  constructor(private servizioAutenticazione: AuthenticationService) {}

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
    this.statoPiatto = 'in-lavorazione';
  }

  fineLavorazione() {
    this.statoPiatto = 'in-consegna';
  }

  consegna() {
    this.statoPiatto = 'consegnato';
  }

  cestina() {
    this.statoPiatto = 'non-in-lavorazione';
  }
}
