import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

import {
	IonContent,
	IonGrid,
	IonRow,
	IonCol,
	IonImg,
	IonCard,
	IonButton,
	IonText,
	ToastController,
	IonSpinner,
} from '@ionic/angular/standalone';

import { TavoloService } from 'src/app/core/services/tavolo.service';
import { OrdProdEstended } from 'src/app/core/interfaces/OrdProd';
import { PrenotazioneService } from 'src/app/core/services/prenotazione.service';
import { PagamentoService } from 'src/app/core/services/pagamento.service';

/**
 * 	Questa pagina serve per mostrare all'utente che ha due metodologie per pagare il proprio pasto,
 * 	permettendogli di scegliere tra pagamento con carta di credito, oppure alla cassa.
 */
@Component({
	selector: 'app-pagamento-tavolo',
	templateUrl: './pagamento-tavolo.page.html',
	styleUrls: ['./pagamento-tavolo.page.scss'],
	standalone: true,
	imports: [
		IonSpinner,
		RouterModule,
		IonText,
		IonButton,
		IonCard,
		IonImg,
		IonCol,
		IonRow,
		IonContent,
		CommonModule,
		FormsModule,
		IonGrid,
	],
})
export class PagamentoTavoloPage implements OnInit {
	totale: number = 0;
	prodotti: OrdProdEstended[] = [];
	codice: string = '';
	error: boolean = false; // Variabile per gestire gli errori
	loading: boolean = true;

	constructor(
		private router: Router,
		private tavoloService: TavoloService,
		private prenotazioneService: PrenotazioneService,
		private pagamentoService: PagamentoService,
		private toastController: ToastController
	) {}

	/**
	 * Appena il componente viene inizializzato effettuaiamo la chiamata alla {@link PrenotazioneService.getTotaleByOrdine}
	 * per ricevere il totale dell'ordine del cliente, tenendo in considerazione le varie romane che erano al tavolo.
	 */
	ngOnInit() {
		const numeroOrdine = this.tavoloService.getNumeroOrdine();
		console.log('Numero ordine:', numeroOrdine);

		if (numeroOrdine !== null && numeroOrdine !== undefined) {
			this.prenotazioneService.getTotaleByOrdine(numeroOrdine).subscribe({
				next: (response: any) => {
					console.log('Risposta completa:', response);
					this.totale = response?.totale ?? 0;
					this.tavoloService.setTotaleQuery(response?.totale ?? 0);
					console.log('Totale ricevuto e assegnato:', this.totale);
					this.error = false;
					this.loading = false;
				},
				error: (err) => {
					console.error('Errore durante la chiamata:', err);
					this.error = true;
					this.loading = false;
				},
			});
		} else {
			console.warn('Numero ordine non valido.');
			this.error = true;
			this.loading = false;
		}
	}

	private getFormattedDate(): string {
		const now = new Date();
		return (
			now.getFullYear() +
			'-' +
			String(now.getMonth() + 1).padStart(2, '0') +
			'-' +
			String(now.getDate()).padStart(2, '0') +
			' ' +
			String(now.getHours()).padStart(2, '0') +
			':' +
			String(now.getMinutes()).padStart(2, '0')
		);
	}

	private async mostraToast(messaggio: string, color: string) {
		const toast = await this.toastController.create({
			message: messaggio,
			duration: 3000,
			color: color,
			position: 'bottom',
		});
		await toast.present();
	}

	/**
	 * Funzione che reindirizza alla schermata di pagamento alla cassa
	 */
	pagaCassa() {
		if (!this.error) {
			const data = this.getFormattedDate();
			const numeroOrdine = this.tavoloService.getNumeroOrdine();
			if (numeroOrdine !== null && numeroOrdine !== undefined) {
				this.pagamentoService
					.ordinePay(
						numeroOrdine,
						this.tavoloService.getTotaleQuery(),
						data
					)
					.subscribe({
						next: (response) => {
							console.log(
								'Pagamento a cassa effettuato:',
								response
							);
							this.router.navigate(['/pagamento-cassa'], { replaceUrl: true });
						},
						error: (err) => {
							if (err.status === 400) {
								this.mostraToast(
									'Ordine già pagato.',
									'warning'
								);
							} else {
								this.mostraToast(
									'Errore: riprova più tardi.',
									'danger'
								);
							}
						},
					});
			} else {
				console.error('Numero ordine non valido per il pagamento.');
				this.mostraToast('Numero ordine non valido.', 'danger');
			}
		} else {
			this.mostraToast('Errore: per favore riprova più tardi.', 'danger');
		}
	}

	/**
	 * Funzione che reindirizza alla schermata di pagamento con carta
	 */
	pagaCarta() {
		if (this.error) {
			this.mostraToast('Errore: per favore riprova più tardi.', 'danger');
			return;
		} else {
			const data = this.getFormattedDate();
			const numeroOrdine = this.tavoloService.getNumeroOrdine();
			if (numeroOrdine !== null && numeroOrdine !== undefined) {
				this.pagamentoService
					.ordinePay(
						numeroOrdine,
						this.tavoloService.getTotaleQuery(),
						data
					)
					.subscribe({
						next: (response) => {
							console.log(
								'Pagamento con carta effettuato:',
								response
							);
							this.router.navigate(['/pagamento-carta'], { replaceUrl: true });
						},
						error: (err) => {
							if (err.status === 400) {
								this.mostraToast(
									'Ordine già pagato.',
									'warning'
								);
							} else {
								this.mostraToast(
									'Errore: riprova più tardi.',
									'danger'
								);
							}
						},
					});
			} else {
				console.error('Numero ordine non valido per il pagamento.');
				this.mostraToast('Numero ordine non valido.', 'danger');
			}
		}
	}
}
