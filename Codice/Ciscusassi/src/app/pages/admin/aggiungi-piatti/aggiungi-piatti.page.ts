import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
	IonButton,
	IonCard,
	IonContent,
	IonHeader,
	IonIcon,
	IonInput,
	IonItem,
	IonLabel,
	IonSelect,
	IonSelectOption,
	IonTextarea,
	IonTitle,
	IonToolbar,
	ToastController,
} from '@ionic/angular/standalone';
import { HttpClientModule } from '@angular/common/http';

import { ApiResponse } from 'src/app/core/interfaces/ApiResponse';
import { ProdottoInput } from 'src/app/core/interfaces/Prodotto';
import { ProdottoService } from 'src/app/core/services/prodotto.service';

@Component({
	selector: 'app-aggiungi-piatti',
	templateUrl: './aggiungi-piatti.page.html',
	styleUrls: ['./aggiungi-piatti.page.scss'],
	standalone: true,
	imports: [
		IonContent,
		IonHeader,
		IonCard,
		IonIcon,
		IonInput,
		IonTextarea,
		IonTitle,
		IonToolbar,
		IonButton,
		IonItem,
		IonLabel,
		IonSelect,
		IonSelectOption,
		CommonModule,
		FormsModule,
		HttpClientModule,
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
		private toastCtrl: ToastController
	) {}

	ngOnInit(): void {}

	// Gestisce la selezione del file immagine e ne salva il contenuto in base64
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

	// Crea un nuovo piatto dopo aver validato i campi
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
			},
			error: async (err) => {
				console.error('❌ Errore HTTP:', err);
				const toast = await this.toastCtrl.create({
					message:
						'❌ Errore durante la creazione del piatto. Dettagli: ' +
						(err?.message || 'Errore sconosciuto'),
					duration: 3000,
					color: 'danger',
					position: 'bottom',
				});
				await toast.present();
			},
		});
	}

	// Resetta i campi del form ai valori iniziali
	resetForm(): void {
		this.nome = '';
		this.descrizione = '';
		this.costo = null;
		this.categoria = '';
		this.immagineBase64 = '';
		this.isPiattoGiorno = false;
	}
}
