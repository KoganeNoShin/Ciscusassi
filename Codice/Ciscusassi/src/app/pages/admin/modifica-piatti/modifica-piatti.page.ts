import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavController } from '@ionic/angular';
import {
	IonButton,
	IonCard,
	IonContent,
	IonIcon,
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
		IonIcon,
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
						toast.present();
						this.router.navigateBack(['/gestisci-piatti']);
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
