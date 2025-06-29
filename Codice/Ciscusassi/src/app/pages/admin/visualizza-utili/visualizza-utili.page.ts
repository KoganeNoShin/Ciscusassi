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
import * as XLSX from 'xlsx'; // Libreria per manipolazione Excel

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

	// Nomi mesi italiani, usati come intestazioni di colonna e per mappatura dati
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

	// Anni disponibili per filtro
	years = [2025, 2024, 2023];

	// Array che contiene i dati da visualizzare in tabella: ogni riga è un oggetto con indirizzo e valori mensili
	rows: { address: string; values: number[] }[] = [];

	constructor(
		private pagamentoService: PagamentoService,
		private filialeService: FilialeService
	) {}

	ngOnInit() {
		// Inizializza selezione anno con il più recente e carica i dati corrispondenti
		this.selectedYear = this.years[0];
		this.loadDataForYear(this.selectedYear);
	}

	// Quando cambia l'anno selezionato, ricarica i dati
	onYearChange() {
		if (this.selectedYear !== null) {
			this.loadDataForYear(this.selectedYear);
		}
	}

	// Carica e struttura i dati dei pagamenti per l'anno scelto
	loadDataForYear(year: number) {
		this.filialeService.GetSedi().subscribe({
			next: (filialiResponse) => {
				const filiali = filialiResponse.data ?? [];

				// Crea una mappa da id filiale a indirizzo completo per migliorare leggibilità
				const filialiMap: { [id: number]: string } = {};
				filiali.forEach((f) => {
					filialiMap[f.id_filiale] = `${f.indirizzo}, ${f.comune}`;
				});

				// Recupera gli utili mensili per l'anno selezionato
				this.pagamentoService.GetUtiliMensili(year).subscribe({
					next: (response) => {
						const dati = response.data;
						if (!dati) {
							this.rows = [];
							return;
						}

						// Inizializza un oggetto per raggruppare i dati per filiale:
						// per ogni filiale crea un array di 12 zeri (uno per ogni mese)
						const grouped: { [filialeId: number]: number[] } = {};
						filiali.forEach((f) => {
							grouped[f.id_filiale] = Array(12).fill(0);
						});

						// Popola l'array con gli importi corretti per mese e filiale
						dati.forEach((pagamento) => {
							const monthIndex = this.months.indexOf(
								pagamento.data
							); // mappa nome mese in indice
							if (monthIndex === -1) {
								console.warn(
									`Mese non riconosciuto: ${pagamento.data}`
								);
								return;
							}

							// Se il filiale non è ancora presente (possibile se dati incompleti), inizializza
							if (!grouped[pagamento.filiale]) {
								grouped[pagamento.filiale] = Array(12).fill(0);
							}

							grouped[pagamento.filiale][monthIndex] =
								pagamento.importo;
						});

						// Trasforma l'oggetto raggruppato in un array compatto per la tabella,
						// ogni riga contiene indirizzo filiale e array di importi mensili
						this.rows = Object.entries(grouped).map(
							([filialeIdStr, values]) => {
								const filialeId = +filialeIdStr;
								return {
									address:
										filialiMap[filialeId] ??
										`Filiale ${filialeId}`,
									values,
								};
							}
						);
					},
					error: (err) => {
						console.error(
							'Errore durante il recupero dei pagamenti:',
							err
						);
						this.rows = [];
					},
				});
			},
			error: (err) => {
				console.error('Errore durante il recupero delle filiali:', err);
				this.rows = [];
			},
		});
	}

	// Calcola il totale di una riga (somma dei valori mensili)
	getRowTotal(row: { values: number[] }): number {
		return row.values.reduce((acc, val) => acc + val, 0);
	}

	// Calcola il totale di una colonna (somma degli stessi mesi su tutte le filiali)
	getColumnTotal(index: number): number {
		return this.rows.reduce((acc, row) => acc + row.values[index], 0);
	}

	// Calcola il totale generale sommando tutti i valori di tutte le righe e colonne
	getGrandTotal(): number {
		return this.rows
			.flatMap((row) => row.values)
			.reduce((acc, val) => acc + val, 0);
	}

	// Formatta un numero secondo la localizzazione italiana (es. 1.000,00)
	formatItalianNumber(value: number): string {
		return value.toLocaleString('it-IT');
	}

	// --- EXPORT EXCEL ---
	exportExcel() {
		// Prepara un array di array (AOA) per creare il foglio Excel:
		// ogni sotto-array rappresenta una riga nel foglio Excel

		const dataForExcel = [];

		// Prima riga: intestazione colonna con indirizzo, mesi, e totale
		const headerRow = ['INDIRIZZO FILIALE', ...this.months, 'TOTALE'];
		dataForExcel.push(headerRow);

		// Per ogni riga (filiale) della tabella:
		// - inserisce l'indirizzo
		// - inserisce i valori mensili formattati in italiano
		// - inserisce il totale riga formattato
		this.rows.forEach((row) => {
			const total = this.getRowTotal(row);
			dataForExcel.push([
				row.address,
				...row.values.map((v) => this.formatItalianNumber(v)),
				this.formatItalianNumber(total),
			]);
		});

		// Aggiunge una riga finale di totali colonna e totale generale
		const totalColumns = this.months.map((_, i) => this.getColumnTotal(i));
		const grandTotal = this.getGrandTotal();
		dataForExcel.push([
			'TOTALE',
			...totalColumns.map((v) => this.formatItalianNumber(v)),
			this.formatItalianNumber(grandTotal),
		]);

		// Crea il foglio di lavoro (worksheet) da array di array
		const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(dataForExcel);

		// Crea un nuovo workbook e aggiunge il foglio creato
		const wb: XLSX.WorkBook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, 'Utili');

		// Salva il file Excel con nome dinamico basato sull'anno selezionato
		XLSX.writeFile(wb, `utili_${this.selectedYear ?? 'anno'}.xlsx`);
	}
}
