// src/app/components/ricevuta/ricevuta.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProdottoRecord } from 'src/app/core/interfaces/Prodotto';

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


  data: string = new Date().toLocaleString();

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

  get totale() {
    return this.prodottiRaggruppati
      .reduce((acc, item) => acc + (item.quantita * item.prodotto.costo), 0)
      .toFixed(2);
  }
}
