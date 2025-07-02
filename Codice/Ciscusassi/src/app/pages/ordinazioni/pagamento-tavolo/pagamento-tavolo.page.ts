import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CarrelloService } from 'src/app/core/services/carrello.service';
import { Router } from '@angular/router';

import {
	IonContent,
	IonGrid,
	IonRow,
	IonCol,
	IonImg,
	IonCard,
	IonCardContent,
	IonButton,
	IonText,
	ToastController,
} from '@ionic/angular/standalone';

import { TavoloService } from 'src/app/core/services/tavolo.service';
import { OrdProdEstended } from 'src/app/core/interfaces/OrdProd';
import { PrenotazioneService } from 'src/app/core/services/prenotazione.service';
import { PagamentoService } from 'src/app/core/services/pagamento.service';

@Component({
	selector: 'app-pagamento-tavolo',
	templateUrl: './pagamento-tavolo.page.html',
	styleUrls: ['./pagamento-tavolo.page.scss'],
	standalone: true,
	imports: [
		RouterModule,
		IonText,
		IonButton,
		IonCardContent,
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

	constructor(
		private servizioCarrello: CarrelloService,
		private router: Router,
		private tavoloService: TavoloService,
		private prenotazioneService: PrenotazioneService,
		private pagamentoService: PagamentoService,
		private toastController: ToastController
	) {}

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
				},
				error: (err) => {
					console.error('Errore durante la chiamata:', err);
					this.totale = 0;
				},
			});
		} else {
			console.warn('Numero ordine non valido.');
			this.totale = 0;
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

	private async mostraToast(messaggio: string) {
		const toast = await this.toastController.create({
			message: messaggio,
			duration: 3000,
			color: 'warning',
			position: 'bottom',
		});
		await toast.present();
	}

	pagaCassa() {
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
						console.log('Pagamento a cassa effettuato:', response);
						this.router.navigate(['/pagamento-cassa']);
					},
					error: (err) => {
						console.error('Errore durante il pagamento alla cassa:', err);
						this.mostraToast('Ordine già pagato o errore nel pagamento.');
					},
				});
		} else {
			console.error('Numero ordine non valido per il pagamento.');
			this.mostraToast('Numero ordine non valido.');
		}
	}

	pagaCarta() {
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
						console.log('Pagamento con carta effettuato:', response);
						this.router.navigate(['/pagamento-carta']);
					},
					error: (err) => {
						console.error('Errore durante il pagamento con carta:', err);
						this.mostraToast('Ordine già pagato o errore nel pagamento.');
					},
				});
		} else {
			console.error('Numero ordine non valido per il pagamento.');
			this.mostraToast('Numero ordine non valido.');
		}
	}
}
