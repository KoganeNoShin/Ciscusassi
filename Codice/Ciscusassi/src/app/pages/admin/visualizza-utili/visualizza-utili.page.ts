import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import * as XLSX from 'xlsx';

import { PagamentoService } from 'src/app/core/services/pagamento.service';
import { FilialeService } from 'src/app/core/services/filiale.service';

@Component({
  selector: 'app-visualizza-utili',
  templateUrl: './visualizza-utili.page.html',
  styleUrls: ['./visualizza-utili.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonButton,
    IonGrid,
    IonRow,
    IonCol,
    IonSelect,
    IonSelectOption,
  ],
})
export class VisualizzaUtiliPage implements OnInit {
  selectedYear: number | null = null;

  months = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
  ];

  years = [2025, 2024, 2023];

  rows: { address: string; values: number[] }[] = [];

  constructor(
    private pagamentoService: PagamentoService,
    private filialeService: FilialeService
  ) {}

  ngOnInit() {
    // Seleziona l’anno più recente di default e carica i dati
    this.selectedYear = this.years[0];
    this.loadDataForYear(this.selectedYear);
  }

  onYearChange() {
    if (this.selectedYear !== null) {
      this.loadDataForYear(this.selectedYear);
    }
  }

  loadDataForYear(year: number) {
    this.filialeService.GetSedi().subscribe({
      next: (filialiResponse) => {
        const filiali = filialiResponse.data ?? [];

        // Mappa id filiale -> indirizzo completo
        const filialiMap: { [id: number]: string } = {};
        filiali.forEach(f => {
          filialiMap[f.id_filiale] = `${f.indirizzo}, ${f.comune}`;
        });

        this.pagamentoService.GetUtiliMensili(year).subscribe({
          next: (response) => {
            const dati = response.data;
            if (!dati) {
              this.rows = [];
              return;
            }

            // Inizializza struttura dati: per ogni filiale un array di 12 zeri
            const grouped: { [filialeId: number]: number[] } = {};
            filiali.forEach(f => {
              grouped[f.id_filiale] = Array(12).fill(0);
            });

            // Per ogni pagamento: trova indice mese e assegna importo
            dati.forEach(pagamento => {
              const monthIndex = this.months.indexOf(pagamento.data);
              if (monthIndex === -1) {
                console.warn(`Mese non riconosciuto: ${pagamento.data}`);
                return;
              }

              // Assicurati che il filiale esista nel grouped
              if (!grouped[pagamento.filiale]) {
                grouped[pagamento.filiale] = Array(12).fill(0);
              }

              grouped[pagamento.filiale][monthIndex] = pagamento.importo;
            });

            // Trasforma in array per la tabella
            this.rows = Object.entries(grouped).map(([filialeIdStr, values]) => {
              const filialeId = +filialeIdStr;
              return {
                address: filialiMap[filialeId] ?? `Filiale ${filialeId}`,
                values
              };
            });
          },
          error: (err) => {
            console.error('Errore durante il recupero dei pagamenti:', err);
            this.rows = [];
          }
        });
      },
      error: (err) => {
        console.error('Errore durante il recupero delle filiali:', err);
        this.rows = [];
      }
    });
  }

  getRowTotal(row: { values: number[] }): number {
    return row.values.reduce((acc, val) => acc + val, 0);
  }

  getColumnTotal(index: number): number {
    return this.rows.reduce((acc, row) => acc + row.values[index], 0);
  }

  getGrandTotal(): number {
    return this.rows
      .flatMap(row => row.values)
      .reduce((acc, val) => acc + val, 0);
  }

  formatItalianNumber(value: number): string {
    return value.toLocaleString('it-IT');
  }

  exportExcel() {
    const dataForExcel = [];

    const headerRow = ['INDIRIZZO FILIALE', ...this.months, 'TOTALE'];
    dataForExcel.push(headerRow);

    this.rows.forEach(row => {
      const total = this.getRowTotal(row);
      dataForExcel.push([
        row.address,
        ...row.values.map(v => this.formatItalianNumber(v)),
        this.formatItalianNumber(total),
      ]);
    });

    const totalColumns = this.months.map((_, i) => this.getColumnTotal(i));
    const grandTotal = this.getGrandTotal();
    dataForExcel.push([
      'TOTALE',
      ...totalColumns.map(v => this.formatItalianNumber(v)),
      this.formatItalianNumber(grandTotal),
    ]);

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(dataForExcel);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Utili');
    XLSX.writeFile(wb, `utili_${this.selectedYear ?? 'anno'}.xlsx`);
  }
}
