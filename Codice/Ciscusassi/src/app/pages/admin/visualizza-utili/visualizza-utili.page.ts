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

// Per esportare Excel (devi installare xlsx: npm install xlsx)
import * as XLSX from 'xlsx';

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
    'Gennaio',
    'Febbraio',
    'Marzo',
    'Aprile',
    'Maggio',
    'Giugno',
    'Luglio',
    'Agosto',
    'Settembre',
    'Ottobre',
    'Novembre',
    'Dicembre',
  ];

  years = [2025, 2024, 2023, 2022, 2021];

  rows: { address: string; values: number[] }[] = [];

  constructor() {}

  ngOnInit() {
    // Imposta anno di default (opzionale)
    this.selectedYear = this.years[0];
    this.loadDataForYear(this.selectedYear);
  }

  onYearChange() {
    if (this.selectedYear !== null) {
      this.loadDataForYear(this.selectedYear);
    }
  }

  loadDataForYear(year: number) {
    // Simulazione caricamento dati da backend (puoi sostituire con chiamata API)
    // Qui per esempio generiamo numeri casuali per ogni mese e indirizzo

    this.rows = [
      {
        address: 'Via Vincenzo Piazza Martini, 45',
        values: this.randomValues(),
      },
      {
        address: 'Via Palmerino , 52/A',
        values: this.randomValues(),
      },
      {
        address: 'Via Saitta Longhi, 116G',
        values: this.randomValues(),
      },
      {
        address: 'Via Catania, 17',
        values: this.randomValues(),
      },
    ];
  }

  randomValues(): number[] {
    // Crea array di 12 valori numerici casuali (da 1000 a 10000)
    return Array.from({ length: 12 }, () =>
      Math.floor(Math.random() * 9000) + 1000
    );
  }

  // Calcola totale per riga
  getRowTotal(row: { values: number[] }): number {
    return row.values.reduce((acc, val) => acc + val, 0);
  }

  // Calcola totale per colonna (mese)
  getColumnTotal(index: number): number {
    if (!this.rows.length) return 0;
    return this.rows.reduce((acc, row) => acc + row.values[index], 0);
  }

  // Calcola totale generale
  getGrandTotal(): number {
    if (!this.rows.length) return 0;
    return this.rows
      .flatMap((row) => row.values)
      .reduce((acc, val) => acc + val, 0);
  }

  exportExcel() {
    // Prepara dati in formato tabellare per Excel
    const dataForExcel = [];

    // Header: indirizzo + mesi + totale
    const headerRow = ['INDIRIZZO FILIALE', ...this.months, 'TOTALE'];
    dataForExcel.push(headerRow);

    // Riga dati
    this.rows.forEach((row) => {
      const total = this.getRowTotal(row);
      dataForExcel.push([row.address, ...row.values, total]);
    });

    // Riga totale per colonne
    const totalColumns = this.months.map((_, i) => this.getColumnTotal(i));
    const grandTotal = this.getGrandTotal();
    dataForExcel.push(['TOTALE', ...totalColumns, grandTotal]);

    // Crea worksheet e workbook
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(dataForExcel);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Utili');

    // Esporta file Excel
    XLSX.writeFile(wb, `utili_${this.selectedYear ?? 'anno'}.xlsx`);
  }
}
