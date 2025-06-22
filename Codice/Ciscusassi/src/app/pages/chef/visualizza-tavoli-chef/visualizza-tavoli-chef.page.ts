import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
	IonContent,
	IonHeader,
	IonTitle,
	IonToolbar,
	IonGrid,
	IonRow,
	IonCol,
	ToastController,
	IonChip,
	IonLabel,
} from '@ionic/angular/standalone';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { PrenotazioneService } from 'src/app/core/services/prenotazione.service';
import { lastValueFrom } from 'rxjs';

@Component({
	selector: 'app-visualizza-tavoli-chef',
	templateUrl: './visualizza-tavoli-chef.page.html',
	styleUrls: ['./visualizza-tavoli-chef.page.scss'],
	standalone: true,
	imports: [
		IonContent,
		IonHeader,
		IonTitle,
		IonToolbar,
		IonGrid,
		IonRow,
		IonCol,
		IonChip,
		IonLabel,
		CommonModule,
		FormsModule,
	],
})
export class VisualizzaTavoliChefPage implements OnInit {
	tavoli: Array<{
		numero: number;
		nome: string;
		orario: string;
		persone: number;
		stato: string;
	}> = [];

	filtroStato: 'tutti' | 'in-lavorazione' | 'non-in-lavorazione' = 'tutti';

	legenda = [
		{ stato: 'non-in-lavorazione', label: 'NON IN LAVORAZIONE' },
		{ stato: 'in-lavorazione', label: 'IN LAVORAZIONE' },
	];

	constructor(
		private toastController: ToastController,
		private authService: AuthenticationService,
		private prenotazioneService: PrenotazioneService
	) {}

	ngOnInit(): void {
		this.loadTavoli();
	}

	async loadTavoli() {
		try {
			const filiale = this.authService.getFiliale();
			const response = await lastValueFrom(
				this.prenotazioneService.getPrenotazioniDelGiornoFiliale(
					filiale
				)
			);

			if (response.success && response.data?.length) {
				const prenotazioniFiltrate = response.data;

				const tavoliCompletati = await Promise.all(
					prenotazioniFiltrate.map(async (p) => {
						try {
							const statoResponse = await lastValueFrom(
								this.prenotazioneService.getStatoPrenotazione(
									p.ref_torretta
								)
							);
							const stato = statoResponse?.data ?? 'attesa';

							return {
								numero: p.ref_torretta,
								nome: `Tavolo ${p.id_prenotazione}`,
								orario: this.formattaOrario(
									p.data_ora_prenotazione
								),
								persone: p.numero_persone,
								stato: stato,
							};
						} catch (err) {
							console.error(
								`Errore stato per torretta ${p.ref_torretta}`,
								err
							);
							return {
								numero: p.ref_torretta,
								nome: `Tavolo ${p.id_prenotazione}`,
								orario: this.formattaOrario(
									p.data_ora_prenotazione
								),
								persone: p.numero_persone,
								stato: 'attesa',
							};
						}
					})
				);

				// Mantieni tutti i tavoli (il filtro lo fa il getter)
				this.tavoli = tavoliCompletati;
			} else {
				this.tavoli = [];
				console.warn('Nessuna prenotazione trovata.');
			}
		} catch (err) {
			console.error('Errore caricamento tavoli:', err);
			this.tavoli = [];
		}
	}

	formattaOrario(dataOra: string): string {
		const data = new Date(dataOra);
		const ora = data.getHours().toString().padStart(2, '0');
		const minuti = data.getMinutes().toString().padStart(2, '0');
		return `${ora}:${minuti}`;
	}

	isCliccabile(tavolo: any): boolean {
		return tavolo.stato !== 'senza-ordini';
	}

	handleClick(tavolo: any) {
		if (this.isCliccabile(tavolo)) {
			console.log('Hai cliccato sul tavolo:', tavolo);
			// Azione specifica per lo chef può essere inserita qui
		}
	}

	async presentToast(messaggio: string) {
		const toast = await this.toastController.create({
			message: messaggio,
			duration: 2000,
			position: 'bottom',
			color: 'success',
		});
		toast.present();
	}

	get tavoliFiltrati() {
		if (this.filtroStato === 'tutti') {
			// Mostra solo tavoli in lavorazione o non in lavorazione
			return this.tavoli.filter(
				(tavolo) =>
					tavolo.stato === 'in-lavorazione' ||
					tavolo.stato === 'non-in-lavorazione'
			);
		}
		return this.tavoli.filter(
			(tavolo) => tavolo.stato === this.filtroStato
		);
	}
}
