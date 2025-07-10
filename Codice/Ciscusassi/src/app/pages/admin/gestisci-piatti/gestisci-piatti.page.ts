import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
	IonChip,
	IonContent,
	IonButton,
	IonIcon,
	ToastController,
	IonText,
	IonSearchbar,
	IonSpinner,
} from '@ionic/angular/standalone';
import { ProdottoService } from 'src/app/core/services/prodotto.service';
import { starOutline, star, add } from 'ionicons/icons';
import { addIcons } from 'ionicons';

import { ApiResponse } from 'src/app/core/interfaces/ApiResponse';
import { ProdottoRecord } from 'src/app/core/interfaces/Prodotto';
import { PiattoAmministratoreComponent } from 'src/app/components/piatto-amministratore/piatto-amministratore.component';
import { RouterModule } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
	selector: 'app-gestisci-piatti',
	templateUrl: './gestisci-piatti.page.html',
	styleUrls: ['./gestisci-piatti.page.scss'],
	standalone: true,
	imports: [
		IonSpinner,
		IonSearchbar,
		IonText,
		IonContent,
		CommonModule,
		FormsModule,
		IonChip,
		IonButton,
		IonIcon,
		PiattoAmministratoreComponent,
		RouterModule,
	],
})
export class GestisciPiattiPage implements OnInit {
	piatti: ProdottoRecord[] = []; // Lista completa dei piatti
	filteredPiatti: ProdottoRecord[] = []; // Piatti filtrati in base a categoria e ricerca
	loading: boolean = true; // Stato caricamento
	error: boolean = false; // Stato errore caricamento
	selectedCategoria: string = 'Tutti'; // Categoria filtro selezionata
	searchTerm: string = ''; // Testo di ricerca

	piattoDelGiorno: ProdottoRecord | null = null; // Piatto del giorno

	isAlertOpen = false; // Stato alert di conferma eliminazione
	selectedProdotto: ProdottoRecord | null = null; // Prodotto selezionato per azioni

	constructor(
		private prodottoService: ProdottoService,
		private toastController: ToastController,
		private alertController: AlertController
	) {
		// Registrazione icone usate nel componente
		addIcons({ starOutline, star, add });
	}

	ngOnInit() {
		this.caricaPiattoDelGiorno();
		this.caricaPiatti();
	}

	/**
	 * Carica tutti i piatti disponibili tramite il servizio `prodottoService`.
	 *
	 * Invia una richiesta per ottenere l’elenco dei prodotti e gestisce la risposta.
	 * In caso di successo, passa i dati al metodo `handleResponse`; in caso di errore,
	 * imposta lo stato di errore e disattiva il caricamento.
	 *
	 * @returns {void}
	 *
	 * @remarks
	 * - Utilizza `GetProdotti()` per recuperare l’elenco completo dei piatti.
	 * - In caso di successo (`next`), i dati vengono gestiti da `handleResponse`.
	 * - In caso di errore (`error`), viene stampato l’errore nella console,
	 *   `loading` viene impostato a `false` e `error` a `true`.
	 */
	caricaPiatti() {
		this.prodottoService.GetProdotti().subscribe({
			next: (response) => this.handleResponse(response),
			error: (err) => {
				console.error(err);
				this.loading = false;
				this.error = true;
			},
		});
	}

	/**
	 * Gestisce la risposta della richiesta di caricamento dei piatti.
	 *
	 * Se la risposta è positiva e contiene dati, assegna l'elenco dei piatti alla proprietà `piatti`
	 * e applica un filtro di categoria predefinito. In caso contrario, imposta lo stato di errore.
	 * In entrambi i casi, disattiva lo stato di caricamento.
	 *
	 * @param {ApiResponse<ProdottoRecord[]>} response - La risposta dell’API contenente un array di prodotti o un messaggio d’errore.
	 *
	 * @returns {void}
	 *
	 * @remarks
	 * - Se `response.success` è `true` e `data` è presente, aggiorna `piatti` con i dati ricevuti.
	 * - Chiama `filterByCategory` con il valore 'Tutti' per mostrare tutti i piatti.
	 * - In caso di errore, stampa il messaggio in console e imposta `error` a `true`.
	 * - In ogni caso, imposta `loading` a `false` al termine della gestione.
	 */
	private handleResponse(response: ApiResponse<ProdottoRecord[]>): void {
		if (response.success && response.data) {
			this.piatti = response.data;
			this.filterByCategory('Tutti');
		} else {
			console.error(response.message || 'Errore sconosciuto');
			this.error = true;
		}
		this.loading = false;
	}

	/**
	 * Carica il piatto del giorno tramite il servizio `prodottoService`.
	 *
	 * Invia una richiesta per ottenere il piatto del giorno e, in caso di successo,
	 * aggiorna la proprietà `piattoDelGiorno`. In caso di errore, registra l’errore in console.
	 *
	 * @returns {void}
	 *
	 * @remarks
	 * - Utilizza `GetPiattoDelGiorno()` per recuperare il piatto del giorno.
	 * - Se la risposta ha successo e contiene dati, aggiorna `piattoDelGiorno`.
	 * - In caso di errore, stampa l’errore nella console senza modificare lo stato dell’interfaccia.
	 */
	caricaPiattoDelGiorno(): void {
		this.prodottoService.GetPiattoDelGiorno().subscribe({
			next: (response) => {
				if (response.success && response.data) {
					this.piattoDelGiorno = response.data;
				}
			},
			error: (err) =>
				console.error(
					'Errore nel caricamento del piatto del giorno',
					err
				),
		});
	}

	/**
	 * Cambia il piatto del giorno impostandone uno nuovo.
	 *
	 * Controlla se il piatto selezionato è già impostato come piatto del giorno.
	 * Se sì, mostra un messaggio di errore e non procede. Altrimenti aggiorna
	 * il piatto del giorno e notifica il servizio, mostrando messaggi di conferma
	 * o errore in base all'esito dell'operazione.
	 *
	 * @param {ProdottoRecord} piatto - Il piatto da impostare come piatto del giorno.
	 *
	 * @returns {void}
	 *
	 * @remarks
	 * - Se si tenta di rimuovere il piatto del giorno senza sostituirlo, viene mostrato un toast di errore e l'operazione è bloccata.
	 * - Chiama `changePiattoDelGiorno` del servizio `prodottoService` per aggiornare il piatto del giorno sul backend.
	 * - In caso di successo, mostra un toast di conferma.
	 * - In caso di errore, stampa l'errore in console e mostra un toast di errore.
	 */
	changePiattoDelGiorno(piatto: ProdottoRecord): void {
		const isAlreadySelected =
			this.piattoDelGiorno?.id_prodotto === piatto.id_prodotto;

		// Se stiamo provando a rimuovere il piatto del giorno senza sostituirlo
		// Diamo un errore e non facciamo nient'altro
		if (isAlreadySelected) {
			this.showToast(
				'Non puoi rimuovere un piatto del giorno senza sostituirlo con un altro!',
				'danger'
			);
			return;
		}

		// Imposta il piatto selezionato come piatto del giorno
		this.piattoDelGiorno = piatto;
		this.prodottoService
			.changePiattoDelGiorno(piatto.id_prodotto)
			.subscribe({
				next: () =>
					this.showToast('Piatto del giorno impostato', 'success'),
				error: (err) => {
					console.error(
						'Errore nell’impostazione del piatto del giorno',
						err
					);
					this.showToast(
						'Errore nell’impostazione del piatto',
						'danger'
					);
				},
			});
	}

	/**
	 * Filtra l’elenco dei piatti in base alla categoria selezionata.
	 *
	 * Aggiorna la lista `filteredPiatti` mostrando tutti i piatti,
	 * solo il piatto del giorno o i piatti di una categoria specifica.
	 *
	 * @param {string} categoria - La categoria in base alla quale filtrare i piatti.
	 *
	 * @returns {void}
	 *
	 * @remarks
	 * - Se la categoria è "Tutti", mostra tutti i piatti senza filtri.
	 * - Se la categoria è "PiattoDelGiorno" e il piatto del giorno è presente, mostra solo quel piatto.
	 * - Altrimenti, filtra i piatti che appartengono alla categoria specificata (convertita in maiuscolo).
	 * - Aggiorna la proprietà `selectedCategoria` con la categoria corrente.
	 */
	filterByCategory(categoria: string) {
		// Imposta la categoria selezionata
		this.selectedCategoria = categoria;

		// Se la categoria è "Tutti", mostriamo tutti i piatti
		if (categoria === 'Tutti') {
			this.filteredPiatti = this.piatti;
		}
		// Se la categoria è "PiattoDelGiorno", mostriamo solo il piatto del giorno
		else if (categoria === 'PiattoDelGiorno' && this.piattoDelGiorno) {
			this.filteredPiatti = this.piatti.filter(
				(p) => p.id_prodotto === this.piattoDelGiorno!.id_prodotto
			);
		}
		// Se la categoria è una categoria specifica, filtriamo per quella categoria
		else {
			this.filteredPiatti = this.piatti.filter(
				(p) => p.categoria === categoria.toUpperCase()
			);
		}
	}

	/**
	 * Applica i filtri correnti sui piatti.
	 *
	 * Filtra prima per categoria utilizzando `filterByCategory`,
	 * poi applica un filtro di ricerca basato sul termine inserito
	 * per cercare nei nomi e nelle descrizioni dei piatti.
	 *
	 * @returns {void}
	 *
	 * @remarks
	 * - Converte il termine di ricerca in minuscolo per una ricerca case-insensitive.
	 * - Aggiorna la lista `filteredPiatti` mantenendo solo i piatti
	 *   il cui nome o descrizione contengono il termine di ricerca.
	 */
	applyFilters() {
		// Usa il metodo filterByCategory per filtrare per categoria
		this.filterByCategory(this.selectedCategoria);

		// Poi applica il filtro di ricerca
		const term = this.searchTerm.toLowerCase();
		this.filteredPiatti = this.filteredPiatti.filter((p) => {
			const matchSearch =
				p.nome.toLowerCase().includes(term) ||
				p.descrizione.toLowerCase().includes(term);
			return matchSearch;
		});
	}

	/**
	 * Mostra un alert di conferma per la cancellazione di un piatto.
	 *
	 * Imposta il prodotto selezionato e apre un alert con due pulsanti:
	 * "Annulla" per annullare l'operazione e "Conferma" per procedere con la cancellazione.
	 * Vengono applicate classi CSS personalizzate per lo stile dei pulsanti e dell'alert.
	 *
	 * @param {ProdottoRecord} prodotto - Il piatto da cancellare.
	 *
	 * @returns {Promise<void>}
	 *
	 * @remarks
	 * - Se l'utente sceglie "Annulla", viene chiamato il metodo `cancellaEliminaProdotto`.
	 * - Se l'utente sceglie "Conferma", viene chiamato il metodo `confermaEliminaProdotto`.
	 * - L'alert viene presentato in modo asincrono.
	 */
	async showAlertDeletePiatto(prodotto: ProdottoRecord) {
		this.selectedProdotto = prodotto;
		this.isAlertOpen = true;

		const alert = await this.alertController.create({
			header: 'Conferma cancellazione',
			message: `Sei sicuro di voler cancellare il piatto ${this.selectedProdotto.nome}?`,
			buttons: [
				{
					text: 'Annulla',
					role: 'cancel',
					handler: async () => {
						this.cancellaEliminaProdotto();
					},
					cssClass: [
						'alert-button-cancel',
						'bg-color-rosso',
						'text-color-bianco',
					],
				},
				{
					text: 'Conferma',
					handler: async () => {
						this.confermaEliminaProdotto();
					},
					cssClass: [
						'alert-button-confirm',
						'bg-color-verdechiaro',
						'text-color-bianco',
					],
				},
			],
			cssClass: ['custom-alert', 'text-color-bianco'],
		});

		await alert.present();
	}

	/**
	 * Conferma e gestisce l’eliminazione del prodotto selezionato.
	 *
	 * Effettua la chiamata al servizio per eliminare il prodotto dal backend.
	 * In caso di successo aggiorna la lista dei piatti e applica i filtri,
	 * mostrando una notifica di conferma.
	 * In caso di errore mostra un messaggio di errore e lo logga in console.
	 * Alla fine chiude l’alert di conferma e resetta il prodotto selezionato.
	 *
	 * @returns {void}
	 *
	 * @remarks
	 * - Se `selectedProdotto` non è definito, semplicemente chiude l’alert senza fare nulla.
	 * - Utilizza metodi come `applyFilters()` e `showToast()` per aggiornare UI e notifiche.
	 */
	confermaEliminaProdotto() {
		if (this.selectedProdotto) {
			const id = this.selectedProdotto.id_prodotto;

			this.prodottoService.deleteProdotto(id).subscribe({
				next: (response) => {
					if (response.success) {
						this.piatti = this.piatti.filter(
							(p) => p.id_prodotto !== id
						);
						this.applyFilters();
						this.showToast(
							'Prodotto eliminato con successo',
							'success'
						);
					} else {
						console.error(
							'Errore nella risposta del server:',
							response.message
						);
						this.showToast(
							'Errore durante l’eliminazione',
							'danger'
						);
					}
				},
				error: (err) => {
					console.error(
						'Errore durante l’eliminazione del prodotto:',
						err
					);
					this.showToast('Errore durante l’eliminazione', 'danger');
				},
				complete: () => {
					this.isAlertOpen = false;
					this.selectedProdotto = null;
				},
			});
		} else {
			this.isAlertOpen = false;
			this.selectedProdotto = null;
		}
	}

	/**
	 * Gestisce l'annullamento della cancellazione di un prodotto.
	 *
	 * Resetta lo stato dell'alert e del prodotto selezionato,
	 * e registra in console l'annullamento dell'operazione.
	 *
	 * @returns {void}
	 */
	cancellaEliminaProdotto() {
		console.log('Rimozione annullata');
		this.isAlertOpen = false;
		this.selectedProdotto = null;
	}

	/**
	 * Mostra un toast con un messaggio personalizzato e colore specificato.
	 *
	 * @param {string} message - Il testo del messaggio da visualizzare nel toast.
	 * @param {'success' | 'danger'} color - Il colore del toast, che può essere 'success' o 'danger'.
	 *
	 * @returns {Promise<void>}
	 *
	 * @remarks
	 * - Il toast viene mostrato al centro dello schermo per 1 secondo.
	 */
	private async showToast(message: string, color: 'success' | 'danger') {
		const toast = await this.toastController.create({
			message,
			duration: 1000,
			color,
			position: 'middle',
		});
		toast.present();
	}
}
