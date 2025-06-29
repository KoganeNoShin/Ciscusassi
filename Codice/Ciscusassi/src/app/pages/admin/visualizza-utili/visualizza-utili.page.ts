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
	IonText,
} from '@ionic/angular/standalone';

import * as XLSX from 'xlsx-js-style';

import { PagamentoService } from 'src/app/core/services/pagamento.service';
import { FilialeService } from 'src/app/core/services/filiale.service';

@Component({
	selector: 'app-visualizza-utili',
	templateUrl: './visualizza-utili.page.html',
	styleUrls: ['./visualizza-utili.page.scss'],
	standalone: true,
	imports: [
		IonText,
		IonContent,
		IonText,
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

	// Funzione che permettte di creare un excel a partire dai dati di un anno specifico
	exportExcel() {
		/* ----- Definiamo e memorizziamo i dati ----- */

		const header = ['INDIRIZZO FILIALE', ...this.months, 'TOTALE']; // Identifichiamo tutti gli header
		const aoa: any[][] = [header]; // array bidimensionale che contiene i dati delle filiali

		// Inseriamo righe dati (senza calcolare i totali)
		this.rows.forEach((row, idx) => {
			// Aggiungiamo la formula per il totale della colonna "Totale" della riga
			// 65 sarebbe il carattere della 'A'.
			const totalFormula = `=SUM(B${idx + 2}:${String.fromCharCode(65 + this.months.length)}${idx + 2})`; // Indice riga e colonna

			// Aggiungiamo una riga di dati all'array bidimensionale
			aoa.push([
				row.address,
				...row.values,
				{ f: totalFormula }, // Aggiungiamo la formula per la colonna Totale
			]);
		});

		// Riga finale: TOTALE (testo, colonne con formula somma, colonna con somma finale)
		const lastRowIndex = aoa.length + 1; // +1 perché è presente l'header che occupa la prima riga

		// Ultima cella per calcolare la somma della riga
		const totalFormulaRow = [
			'TOTALE',
			...this.months.map((_, colIdx) => ({
				f: `SUM(${String.fromCharCode(66 + colIdx)}2:${String.fromCharCode(66 + colIdx)}${lastRowIndex - 1})`,
			})),
			{
				f: `SUM(${String.fromCharCode(66 + this.months.length)}2:${String.fromCharCode(66 + this.months.length)}${lastRowIndex - 1})`,
			},
		];
		aoa.push(totalFormulaRow);

		/* ----- Stile delle celle ----- */

		// Creiamo il foglio con tutti i dati che abbiamo costruito prima
		const ws = XLSX.utils.aoa_to_sheet(aoa);

		// Capiamo la dimensione del foglio
		const range = XLSX.utils.decode_range(ws['!ref']!);

		for (let R = range.s.r; R <= range.e.r; ++R) {
			// Per ogni riga
			const isHeader = R === 0; // verifichiamo se la riga è l'header
			const isFooter = R === range.e.r; // oppure se è il footer
			const even = R % 2 === 0; // controlliamo se la riga è pari
			for (let C = range.s.c; C <= range.e.c; ++C) {
				// Cicliamo per ogni colonna
				const cellRef = XLSX.utils.encode_cell({ r: R, c: C }); // Otteniamo il riferimento alla cella
				const cell = ws[cellRef]; // Otteniamo la cella
				if (!cell) continue; // Se la cella non esiste skippiamo

				const isAddress = C === 0; // Verifichiamo se la colonna è dell'indirizzo della filiale
				const isTotalCol = C === range.e.c; // Verifichiamo se è quella del totale

				// Impostiamo gli stili per la singola cella
				cell.s = {
					font: {
						bold: isHeader || isFooter || isAddress || isTotalCol, // Grassetto per header, footer, indirizzo e totale
						color: {
							rgb: isHeader || isFooter ? 'FFFFFF' : '000000', // Colore bianco per header e footer, nero per altre celle
						},
					},
					fill: {
						patternType: 'solid',
						fgColor: {
							rgb:
								isHeader || isFooter
									? '3E885B' // Sfondo verde per header e footer
									: even
										? 'FFFFFF' // Sfondo bianco per le righe pari
										: 'F7F9FC', // Sfondo Grigio chiaro per le righe dispari
						},
					},
					alignment: {
						horizontal: isAddress ? 'left' : 'center', // Allineamento a sinistra per gli indirizzi
						vertical: 'middle', // Allineamento verticale al centro
					},
					numFmt: C > 0 ? '€#,##0' : undefined, // Formato in euro per le colonne numeriche
				};
			}
		}

		/* ----- Larghezza delle celle ----- */

		const colWidths = []; // Adattiamo la larghezza delle colonne in base al contenuto
		for (let C = range.s.c; C <= range.e.c; ++C) {
			let max = 10; // Larghezza minima
			for (let R = range.s.r; R <= range.e.r; ++R) {
				const ref = XLSX.utils.encode_cell({ r: R, c: C }); // Riferimento della cella
				const val = ws[ref]?.v?.toString() ?? ws[ref]?.f ?? ''; // Valore della cella
				max = Math.max(max, val.length); // Lunghezza massima del valore
			}
			colWidths.push({ wch: max + 2 }); // Aggiungiamo larghezza alla colonna
		}
		ws['!cols'] = colWidths; // Imposta le larghezze delle colonne nel foglio

		/* ----- Creiamo e salviamo il file ----- */

		const wb = XLSX.utils.book_new(); // Creiamo un nuovo workbook (file)
		XLSX.utils.book_append_sheet(wb, ws, 'Utili'); // Aggiungiamo il foglio al book
		XLSX.writeFile(wb, `utili_${this.selectedYear}.xlsx`); // Salviamo il file excel
	}
}
