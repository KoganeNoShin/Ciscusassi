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

  years = [2025, 2024, 2023, 2022, 2021];

  rows: { address: string; values: number[] }[] = [];

  constructor() {}

  ngOnInit() {
    this.selectedYear = this.years[0];
    this.loadDataForYear(this.selectedYear);
  }

  onYearChange() {
    if (this.selectedYear !== null) {
      this.loadDataForYear(this.selectedYear);
    }
  }

  loadDataForYear(year: number) {
    this.rows = [
      { address: 'Via Vincenzo Piazza Martini, 45', values: this.randomValues() },
      { address: 'Via Palmerino , 52/A', values: this.randomValues() },
      { address: 'Via Saitta Longhi, 116G', values: this.randomValues() },
      { address: 'Via Catania, 17', values: this.randomValues() },
    ];
  }

  randomValues(): number[] {
    return Array.from({ length: 12 }, () =>
      Math.floor(Math.random() * 9000) + 1000
    );
  }

  getRowTotal(row: { values: number[] }): number {
    return row.values.reduce((acc, val) => acc + val, 0);
  }

  getColumnTotal(index: number): number {
    if (!this.rows.length) return 0;
    return this.rows.reduce((acc, row) => acc + row.values[index], 0);
  }

  getGrandTotal(): number {
    if (!this.rows.length) return 0;
    return this.rows
      .flatMap((row) => row.values)
      .reduce((acc, val) => acc + val, 0);
  }

  formatItalianNumber(value: number): string {
    return value.toLocaleString('it-IT');
  }

  exportExcel() {
    const dataForExcel = [];

    // Header
    const headerRow = ['INDIRIZZO FILIALE', ...this.months, 'TOTALE'];
    dataForExcel.push(headerRow);

    // Dati righe
    this.rows.forEach((row) => {
      const total = this.getRowTotal(row);
      dataForExcel.push([
        row.address,
        ...row.values.map((v) => this.formatItalianNumber(v)),
        this.formatItalianNumber(total),
      ]);
    });

    // Totali colonne
    const totalColumns = this.months.map((_, i) => this.getColumnTotal(i));
    const grandTotal = this.getGrandTotal();
    dataForExcel.push([
      'TOTALE',
      ...totalColumns.map((v) => this.formatItalianNumber(v)),
      this.formatItalianNumber(grandTotal),
    ]);

    // Crea foglio e file
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(dataForExcel);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Utili');

    // Salva file
    XLSX.writeFile(wb, `utili_${this.selectedYear ?? 'anno'}.xlsx`);
    
  }
}
