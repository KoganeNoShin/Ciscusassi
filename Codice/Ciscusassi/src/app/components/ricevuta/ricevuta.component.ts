// src/app/components/ricevuta/ricevuta.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProdottoRecord } from 'src/app/core/interfaces/Prodotto';
import { TavoloService } from 'src/app/core/services/tavolo.service';
import { PrenotazioneService } from 'src/app/core/services/prenotazione.service';

@Component({
  selector: 'app-ricevuta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ricevuta.component.html',
  styleUrls: ['./ricevuta.component.scss']
})
export class RicevutaComponent {
  @Input() carrello: ProdottoRecord[] = [];
  @Input() logo!: string;
  @Input() servizio: string = '';
  numeroOrdine: number | null = null;


  data: string = new Date().toLocaleString();

  constructor(private tavoloService: TavoloService, private prenotazioneService: PrenotazioneService){

  }

  get prodottiRaggruppati() {
    const raggruppati: { [nome: string]: { prodotto: ProdottoRecord; quantita: number } } = {};
    for (const p of this.carrello) {
      if (raggruppati[p.nome]) {
        raggruppati[p.nome].quantita += 1;
      } else {
        raggruppati[p.nome] = { prodotto: p, quantita: 1 };
      }
    }
    return Object.values(raggruppati);
  }

  get totale(): number {
    return Number(
      this.prodottiRaggruppati
        .reduce((acc, item) => acc + (item.quantita * item.prodotto.costo), 0)
        .toFixed(2)
    );
  }

  totaleQuery: number = 0;

  ngOnInit() {
    this.numeroOrdine = this.tavoloService.getNumeroOrdine();
    if (this.numeroOrdine !== null && this.numeroOrdine !== undefined) {
      this.prenotazioneService.getTotaleByOrdine(this.numeroOrdine).subscribe((response: any) => {
        this.totaleQuery = response?.data?.totale ?? 0;
      });
    } else {
      this.totaleQuery = 0;
    }
  }
}
