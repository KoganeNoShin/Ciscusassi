import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonSpinner, IonContent, IonGrid, IonRow, IonCol, IonCard, IonImg } from '@ionic/angular/standalone';

import { TavoloService } from 'src/app/core/services/tavolo.service';
import { PrenotazioneService } from 'src/app/core/services/prenotazione.service';
import { OrdProdEstended } from 'src/app/core/interfaces/OrdProd';

@Component({
  selector: 'app-pagamento-cassa',
  templateUrl: './pagamento-cassa.page.html',
  styleUrls: ['./pagamento-cassa.page.scss'],
  standalone: true,
  imports: [
    IonSpinner,
    IonContent,
    CommonModule,
    FormsModule,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonImg,
  ],
})
export class PagamentoCassaPage implements OnInit {
  totale: number = 0;
  numeroOrdine: number | null = null;
  isLoading: boolean = true;

  numeroTavolo: number | null = null;
  prodotti: OrdProdEstended[] = [];
  codice: string = '';
  logo: string = '';       // se serve passare un logo
  servizio: string = '';   // se serve passare il tipo servizio

  constructor(
    private tavoloService: TavoloService,
    private prenotazioneService: PrenotazioneService
  ) {}

  ngOnInit() {
    this.ngViewWillEnter();
  }

  ngViewWillEnter() {
    this.isLoading = true;

    this.numeroTavolo = this.tavoloService.getNumeroTavolo();
    this.numeroOrdine = this.tavoloService.getNumeroOrdine();

    if (this.numeroOrdine !== null && this.numeroOrdine !== undefined) {
      this.prenotazioneService.getTotaleByOrdine(this.numeroOrdine).subscribe({
        next: (response: any) => {
          this.totale = response?.totale ?? 0;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Errore durante il recupero del totale:', err);
          this.totale = 0;
          this.isLoading = false;
        },
      });
    } else {
      this.totale = 0;
      this.isLoading = false;
    }

    this.prodotti = this.tavoloService.getOrdini();

    this.codice =
      this.numeroOrdine !== null && this.numeroOrdine !== undefined
        ? `ordine: ${this.numeroOrdine}`
        : '';
  }
}
