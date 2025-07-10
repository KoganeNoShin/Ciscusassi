import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavController } from '@ionic/angular';
import {
	IonButton,
	IonCard,
	IonContent,
	IonInput,
	IonTextarea,
	IonItem,
	IonSelect,
	IonSelectOption,
	ToastController,
	IonText,
	IonCardContent,
	IonImg,
	IonGrid,
	IonRow,
	IonCol,
} from '@ionic/angular/standalone';

import { ProdottoService } from 'src/app/core/services/prodotto.service';
import { ApiResponse } from 'src/app/core/interfaces/ApiResponse';
import { ProdottoInput } from 'src/app/core/interfaces/Prodotto';

@Component({
	selector: 'app-modifica-piatti',
	templateUrl: './modifica-piatti.page.html',
	styleUrls: ['./modifica-piatti.page.scss'],
	standalone: true,
	imports: [
		IonCol,
		IonRow,
		IonGrid,
		IonImg,
		IonCardContent,
		IonText,
		IonContent,
		IonCard,
		IonItem,
		IonInput,
		IonTextarea,
		IonSelect,
		IonSelectOption,
		CommonModule,
		FormsModule,
		IonButton,
	],
})
export class ModificaPiattiPage implements OnInit {
	// Oggetto piatto con proprietà iniziali
	p: any = {
		id_prodotto: null,
		nome: '',
		descrizione: '',
		costo: null,
		categoria: '',
		immagine: '',
	};

	// Categorie selezionabili per il piatto
	categorieDisponibili: string[] = ['ANTIPASTO', 'PRIMO', 'BEVANDA', 'DOLCE'];

	constructor(
		private prodottoService: ProdottoService,
		private toastCtrl: ToastController,
		private router: NavController
	) {}

	ngOnInit() {
		// Recupera il piatto passato tramite stato di navigazione
		const navigation = window.history.state;
		if (navigation && navigation.piatto) {
			this.p = { ...navigation.piatto };
		}
	}

	/**
	 * Modifica un piatto esistente inviando i dati aggiornati al backend.
	 *
	 * @remarks
	 * - Verifica che l'ID del prodotto (`p.id_prodotto`) sia presente prima di procedere.
	 * - Prepara un oggetto `ProdottoInput` con i dati aggiornati presi da `this.p`.
	 * - Effettua la chiamata al servizio `updateProdotto` con l'ID e l'input.
	 * - In caso di successo, mostra un toast di conferma e torna indietro nella navigazione.
	 * - In caso di errore, mostra un toast di errore con il messaggio ricevuto o uno generico.
	 * - Gestisce anche eventuali errori di comunicazione con il server mostrando un toast.
	 *
	 * @returns {Promise<void>}
	 */
	async modificaPiatto() {
		// Verifica che l'id del prodotto sia presente
		if (!this.p.id_prodotto) {
			console.error('ID prodotto mancante, impossibile modificare');
			return;
		}

		// Prepara l'input per la chiamata di update
		const prodottoInput: ProdottoInput = {
			nome: this.p.nome,
			descrizione: this.p.descrizione,
			costo: this.p.costo,
			categoria: this.p.categoria,
			immagine: this.p.immagine,
			is_piatto_giorno: this.p.is_piatto_giorno || false,
		};

		// Chiamata al servizio per aggiornare il prodotto
		this.prodottoService
			.updateProdotto(this.p.id_prodotto, prodottoInput)
			.subscribe({
				next: async (response: ApiResponse<void>) => {
					if (response.success) {
						const toast = await this.toastCtrl.create({
							message: 'Piatto modificato con successo',
							duration: 2000,
							color: 'success',
						});
						await toast.present();
						this.router.back();
					} else {
						const toast = await this.toastCtrl.create({
							message:
								'Errore: ' +
								(response.message || 'Modifica fallita'),
							duration: 2000,
							color: 'danger',
						});
						toast.present();
						console.error('Errore nel backend:', response.message);
					}
				},
				error: async (err) => {
					console.error('Errore nella chiamata updateProdotto:', err);
					const toast = await this.toastCtrl.create({
						message: 'Errore di comunicazione col server',
						duration: 2000,
						color: 'danger',
					});
					toast.present();
				},
			});
	}

	/**
	 * Gestisce la selezione di un file immagine da input HTML,
	 * ne verifica il tipo e ne converte il contenuto in formato Base64.
	 *
	 * @param event - Evento di selezione file proveniente dall'input file.
	 *
	 * @remarks
	 * - Verifica che il file selezionato sia di tipo immagine.
	 * - Utilizza FileReader per leggere il contenuto come DataURL (Base64).
	 * - Assegna il risultato Base64 alla proprietà `immagine` dell'oggetto `p`.
	 * - Se il file non è un'immagine valida, mostra un alert all'utente.
	 */
	onFileSelected(event: any): void {
		// Gestisce la selezione del file immagine e converte in base64
		const file = event.target.files[0];
		if (file && file.type.startsWith('image/')) {
			const reader = new FileReader();
			reader.onload = () => {
				this.p.immagine = reader.result as string;
			};
			reader.readAsDataURL(file);
		} else {
			alert('Seleziona un file immagine valido.');
		}
	}
}
