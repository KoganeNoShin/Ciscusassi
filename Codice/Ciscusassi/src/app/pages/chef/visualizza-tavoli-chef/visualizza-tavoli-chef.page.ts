import { Component, OnInit, OnDestroy } from '@angular/core'; // Aggiunto OnDestroy
import { CommonModule } from '@angular/common';
import {
	IonContent,
	IonHeader,
	IonTitle,
	IonToolbar,
	IonGrid,
	IonRow,
	IonCol,
	IonChip,
	ToastController,
	IonLabel,
} from '@ionic/angular/standalone';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { PrenotazioneService } from 'src/app/core/services/prenotazione.service';
import { lastValueFrom } from 'rxjs';
import { TavoloService } from 'src/app/core/services/tavolo.service';
import { Router } from '@angular/router';

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
		CommonModule,
		IonLabel,
	],
})
export class VisualizzaTavoliChefPage implements OnInit, OnDestroy {
	tavoli: Array<{
		numero: number;
		nome: string;
		orario: string;
		persone: number;
		stato: string;
	}> = [];

	tavoliFiltrati: typeof this.tavoli = [];

	legenda = [
		{ stato: 'in-lavorazione', label: 'IN LAVORAZIONE' },
		{ stato: 'non-in-lavorazione', label: 'NON IN LAVORAZIONE' },
	];

	selectedFilter: string = 'tutti';

	private intervalloAggiornamento: any; // Timer per auto-refresh
	localeAperto: boolean = false;
  private intervalTavoli: any;
	private intervalApertura: any;

	constructor(
		private toastController: ToastController,
		private authService: AuthenticationService,
		private prenotazioneService: PrenotazioneService,
    private tavoloService: TavoloService,
    private router: Router
	) {}

	ngOnInit(): void {
		if (this.localeAperto) {
			this.loadTavoli();
			this.intervalTavoli = setInterval(() => this.loadTavoli(), 30000);
		}
		this.checkOrariApertura();
		this.intervalApertura = setInterval(
			() => this.checkOrariApertura(),
			30000
		);
	}

	ngOnDestroy(): void {
		if (this.intervalTavoli) {
			clearInterval(this.intervalTavoli);
		}
		if (this.intervalApertura) {
			clearInterval(this.intervalApertura);
		}
	}

  checkOrariApertura() {
		const now = new Date();
		const isInRange = (
			startH: number,
			startM: number,
			endH: number,
			endM: number
		): boolean => {
			const start = new Date(now);
			start.setHours(startH, startM, 0, 0);

			const end = new Date(now);
			if (endH === 0) {
				end.setDate(end.getDate() + 1);
				end.setHours(0, 0, 0, 0);
			} else {
				end.setHours(endH, endM, 0, 0);
			}

			return now >= start && now <= end;
		};

		const eraApertoPrima = this.localeAperto;

		this.localeAperto =
			isInRange(12, 50, 15, 50) || isInRange(19, 20, 0, 0);

		// Se il locale è appena passato da chiuso ad aperto
		if (!eraApertoPrima && this.localeAperto) {
			this.loadTavoli();
			this.intervalTavoli = setInterval(() => this.loadTavoli(), 30000);
		}
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
									p.id_prenotazione
								)
							);
							const stato =
								statoResponse?.data ?? 'in-lavorazione';

							return {
								numero: p.ref_torretta,
								nome: `Prenotazione: ${p.id_prenotazione}`,
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
								nome: `Prenotazione: ${p.id_prenotazione}`,
								orario: this.formattaOrario(
									p.data_ora_prenotazione
								),
								persone: p.numero_persone,
								stato: 'in-lavorazione',
							};
						}
					})
				);

				this.tavoli = tavoliCompletati;
				this.applicaFiltro();
			} else {
				this.tavoli = [];
				this.tavoliFiltrati = [];
				console.warn('Nessuna prenotazione trovata.');
			}
		} catch (err: any) {
			console.error('Errore caricamento tavoli:', err);
			const messaggio =
				err?.error?.message || 'Errore durante il caricamento';
			this.presentToast(messaggio, 'danger');
			this.tavoli = [];
			this.tavoliFiltrati = [];
		}
	}

	formattaOrario(dataOra: string): string {
		const data = new Date(dataOra);
		const ora = data.getHours().toString().padStart(2, '0');
		const minuti = data.getMinutes().toString().padStart(2, '0');
		return `${ora}:${minuti}`;
	}

	async presentToast(
		messaggio: string,
		colore: 'success' | 'danger' = 'success'
	) {
		const toast = await this.toastController.create({
			message: messaggio,
			duration: 2000,
			position: 'bottom',
			color: colore,
		});
		toast.present();
	}

	filtraPerStato(stato: string | null) {
		if (stato) {
			this.selectedFilter = stato;
			this.applicaFiltro();
		}
	}

	applicaFiltro() {
		if (this.selectedFilter === 'tutti') {
			this.tavoliFiltrati = this.tavoli.filter(
				(t) =>
					t.stato === 'in-lavorazione' ||
					t.stato === 'non-in-lavorazione'
			);
		} else {
			this.tavoliFiltrati = this.tavoli.filter(
				(t) => t.stato === this.selectedFilter
			);
		}
	}

	isCliccabile(tavolo: any): boolean {
		return true;
	}

	handleClick(tavolo: any) {
	    if (this.isCliccabile(tavolo)) {
			console.log('Hai cliccato sul tavolo:', tavolo);
			this.tavoloService.setTavolo(tavolo);
			this.router.navigate(['/visualizza-ordini-chef']);
		}
	}
}
