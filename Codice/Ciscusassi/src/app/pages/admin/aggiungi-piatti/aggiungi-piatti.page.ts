import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
	IonButton,
	IonCard,
	IonContent,
	IonInput,
	IonItem,
	IonSelect,
	IonSelectOption,
	IonTextarea,
	ToastController,
	IonText,
	IonCardContent,
	IonGrid,
	IonCol,
	IonRow,
	IonImg,
} from '@ionic/angular/standalone';

import { NavController } from '@ionic/angular';

import { ProdottoInput } from 'src/app/core/interfaces/Prodotto';
import { ProdottoService } from 'src/app/core/services/prodotto.service';

@Component({
	selector: 'app-aggiungi-piatti',
	templateUrl: './aggiungi-piatti.page.html',
	styleUrls: ['./aggiungi-piatti.page.scss'],
	standalone: true,
	imports: [
		IonImg,
		IonRow,
		IonCol,
		IonGrid,
		IonCardContent,
		IonText,
		IonContent,
		IonCard,
		IonInput,
		IonTextarea,
		IonButton,
		IonItem,
		IonSelect,
		IonSelectOption,
		CommonModule,
		FormsModule,
	],
})
export class AggiungiPiattiPage implements OnInit {
	// Nome del piatto
	nome: string = '';
	// Descrizione del piatto
	descrizione: string = '';
	// Costo del piatto, può essere null se non inserito
	costo: number | null = null;
	// Categoria del piatto (es: ANTIPASTO, PRIMO, ecc.)
	categoria: string = '';
	// Immagine codificata in base64
	immagineBase64: string = '';
	// Flag che indica se il piatto è il "piatto del giorno"
	isPiattoGiorno: boolean = false;

	// Elenco delle categorie disponibili per selezionare nel form
	categorieDisponibili: string[] = ['ANTIPASTO', 'PRIMO', 'BEVANDA', 'DOLCE'];

	constructor(
		private prodottoService: ProdottoService,
		private toastCtrl: ToastController,
		private router: NavController
	) {}

	ngOnInit(): void {}

	/**
	 * Gestisce la selezione di un file da input e ne converte il contenuto in formato Base64.
	 *
	 * @param {any} event - Evento generato dalla selezione del file, contenente il file scelto.
	 *
	 * @returns {void}
	 *
	 * @remarks
	 * - Converte il primo file selezionato in stringa Base64 e lo assegna a `immagineBase64`.
	 * - Utilizza un oggetto FileReader per la conversione asincrona.
	 */
	onFileSelected(event: any): void {
		const file = event.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				this.immagineBase64 = reader.result as string;
			};
			reader.readAsDataURL(file);
		}
	}

	/**
	 * Crea un nuovo piatto dopo aver validato i campi obbligatori.
	 *
	 * @returns {Promise<void>} Una Promise che si risolve al completamento dell'operazione.
	 *
	 * @remarks
	 * - Verifica che i campi obbligatori (nome, categoria, costo, immagine) siano compilati correttamente.
	 * - Mostra messaggi toast di avviso in caso di campi mancanti o costo negativo.
	 * - Costruisce un oggetto `ProdottoInput` da inviare al servizio per la creazione del piatto.
	 * - Effettua la chiamata al servizio `prodottoService.addProdotto` e gestisce la risposta.
	 * - In caso di successo, mostra un toast di conferma, resetta il form e torna indietro nella navigazione.
	 * - In caso di errore, mostra un toast di errore e logga l'errore sulla console.
	 */
	async creaPiatto(): Promise<void> {
		// Verifica che i campi obbligatori siano compilati
		if (
			!this.nome.trim() ||
			!this.categoria ||
			this.costo === null ||
			!this.immagineBase64
		) {
			const toast = await this.toastCtrl.create({
				message:
					'⚠️ Tutti i campi obbligatori devono essere compilati.',
				duration: 2500,
				color: 'warning',
				position: 'bottom',
			});
			await toast.present();
			return;
		} else if (this.costo < 0) {
			const toast = await this.toastCtrl.create({
				message: 'Il costo non può essere negativo',
				duration: 2500,
				color: 'danger',
				position: 'bottom',
			});
			await toast.present();
			return;
		}

		// Prepara l'oggetto ProdottoInput da inviare al servizio
		const nuovoProdotto: ProdottoInput = {
			nome: this.nome.trim(),
			descrizione: this.descrizione?.trim() || '',
			costo: this.costo,
			categoria: this.categoria,
			immagine: this.immagineBase64,
			is_piatto_giorno: this.isPiattoGiorno === true ? true : false,
		};

		// Invoca il servizio per aggiungere il piatto
		this.prodottoService.addProdotto(nuovoProdotto).subscribe({
			next: async (response) => {
				console.log('✅ Risposta dal server:', response);

				const toast = await this.toastCtrl.create({
					message: '✅ Piatto creato correttamente.',
					duration: 2000,
					color: 'success',
					position: 'bottom',
				});
				await toast.present();

				// Resetta i campi del form dopo l'aggiunta
				this.resetForm();

				this.router.back();
			},
			error: async (err) => {
				console.error('❌ Errore HTTP:', err);
				const toast = await this.toastCtrl.create({
					message: '❌ Errore durante la creazione del piatto.',
					duration: 3000,
					color: 'danger',
					position: 'bottom',
				});
				await toast.present();
			},
		});
	}

	/**
	 * Resetta i campi del form di creazione/modifica del piatto ai valori predefiniti.
	 *
	 * @returns {void}
	 *
	 * @remarks
	 * - Imposta a stringa vuota i campi `nome`, `descrizione`, `categoria` e `immagineBase64`.
	 * - Imposta a `null` il campo `costo`.
	 * - Imposta a `false` il flag `isPiattoGiorno`.
	 */
	resetForm(): void {
		this.nome = '';
		this.descrizione = '';
		this.costo = null;
		this.categoria = '';
		this.immagineBase64 = '';
		this.isPiattoGiorno = false;
	}
}
