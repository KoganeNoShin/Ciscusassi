import { Component, OnInit, OnDestroy } from '@angular/core';
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
	IonButton,
	IonModal,
	ToastController,
	IonChip,
} from '@ionic/angular/standalone';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { PrenotazioneService } from 'src/app/core/services/prenotazione.service';
import { lastValueFrom } from 'rxjs';
import { PrenotazioneRequest } from 'src/app/core/interfaces/Prenotazione';

@Component({
	selector: 'app-visualizza-tavoli',
	templateUrl: './visualizza-tavoli-cameriere.page.html',
	styleUrls: ['./visualizza-tavoli-cameriere.page.scss'],
	standalone: true,
	imports: [
		IonContent,
		IonHeader,
		IonTitle,
		IonToolbar,
		IonGrid,
		IonRow,
		IonCol,
		IonButton,
		IonModal,
		IonChip,
		CommonModule,
		FormsModule,
	],
})
export class VisualizzaTavoliCamerierePage implements OnInit, OnDestroy {
	tavoli: Array<{
		numero: number;
		nome: string;
		orario: string;
		persone: number;
		stato: string;
	}> = [];
	tavoliFiltrati: typeof this.tavoli = [];
	legenda = [
		{ stato: 'in-consegna', label: 'IN CONSEGNA' },
		{ stato: 'consegnato', label: 'CONSEGNATO' },
		{ stato: 'non-in-lavorazione', label: 'NON IN LAVORAZIONE' },
		{ stato: 'in-lavorazione', label: 'IN LAVORAZIONE' },
		{ stato: 'senza-ordini', label: 'SENZA ORDINI' },
		{ stato: 'attesa-arrivo', label: 'ATTESA ARRIVO' },
	];

	selectedFilter: string | null = null;
	showPopup = false;
	personePossibili = [1, 2, 3, 4, 5, 6, 7];
	personeSelezionate: number | null = null;
	inputManuale: number | null = null;
	refClienteInput: string = '';

	showConfermaArrivoPopup = false;
	tavoloDaConfermare: any = null;

	localeAperto: boolean = false;
	private intervalTavoli: any;
	private intervalApertura: any;

	constructor(
		private toastController: ToastController,
		private authService: AuthenticationService,
		private prenotazioneService: PrenotazioneService
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
		if (!this.localeAperto) {
			// Non carichiamo tavoli se il locale è chiuso
			this.tavoli = [];
			this.tavoliFiltrati = [];
			return;
		}

		try {
			const filiale = this.authService.getFiliale();
			const resp = await lastValueFrom(
				this.prenotazioneService.getPrenotazioniDelGiornoFiliale(
					filiale
				)
			);

			if (resp.success && resp.data?.length) {
				const tavoliComp = await Promise.all(
					resp.data.map(async (p) => {
						try {
							const statoResp = await lastValueFrom(
								this.prenotazioneService.getStatoPrenotazione(
									p.id_prenotazione
								)
							);
							return {
								numero: p.id_prenotazione,
								nome: `Torretta: ${p.ref_torretta}`,
								orario: this.formattaOrario(
									p.data_ora_prenotazione
								),
								persone: p.numero_persone,
								stato: statoResp.data ?? 'attesa',
							};
						} catch (e) {
							console.error(e);
							return {
								numero: p.id_prenotazione,
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

				this.tavoli = tavoliComp;
				this.applicaFiltro();
			} else {
				this.tavoli = [];
				this.tavoliFiltrati = [];
			}
		} catch (e) {
			console.error('Errore caricamento tavoli:', e);
			this.tavoli = [];
			this.tavoliFiltrati = [];
		}
	}

	formattaOrario(dataOra: string): string {
		const d = new Date(dataOra);
		return `${d.getHours().toString().padStart(2, '0')}:${d
			.getMinutes()
			.toString()
			.padStart(2, '0')}`;
	}

	add() {
		if (!this.localeAperto) {
			this.presentToast(
				'Il locale è chiuso, non è possibile aggiungere prenotazioni.',
				'warning'
			);
			return;
		}
		this.showPopup = true;
		this.resetPopup();
	}

	selezionaPersone(n: number) {
		this.personeSelezionate = n;
		this.inputManuale = n;
	}

	onInputChange() {
		if (
			this.inputManuale !== null &&
			this.personePossibili.includes(this.inputManuale)
		) {
			this.personeSelezionate = this.inputManuale;
		} else {
			this.personeSelezionate = null;
		}
	}

	async conferma() {
		const persone = this.personeSelezionate ?? this.inputManuale;
		let refCliente: number | null = null;

		if (!persone || persone < 1) {
			await this.presentToast(
				'Inserisci un numero valido di persone',
				'warning'
			);
			return;
		}

		if (this.refClienteInput.trim() !== '') {
			const parsed = parseInt(this.refClienteInput.trim(), 10);
			if (!isNaN(parsed)) {
				refCliente = parsed;
			} else {
				await this.presentToast('ref_cliente non valido', 'warning');
				return;
			}
		}

		// === Logica simile a salvaPersone ===
		const MAX_PERSONE = 999999;
		let numeroPersoneFinale = persone;

		if (numeroPersoneFinale > MAX_PERSONE) {
			numeroPersoneFinale = MAX_PERSONE;
		}

		let numeroTavoliRichiesti = 0;

		for (let t = 2; t <= numeroPersoneFinale; t++) {
			const postiDisponibili = 2 * t + 2;
			if (postiDisponibili >= numeroPersoneFinale) {
				numeroTavoliRichiesti = t;
				break;
			}
		}

		// Assumiamo che authService.getNumeroTavoli() esista, oppure hardcodiamo un valore
		const numTavoliDisponibili = 20; // Sostituisci con valore reale se disponibile

		if (numeroTavoliRichiesti > numTavoliDisponibili) {
			await this.presentToast(
				'Non ci sono abbastanza tavoli disponibili per il numero di persone selezionato.',
				'danger'
			);
			return;
		}
		// === Fine logica salvaPersone ===

		const filialeId = this.authService.getFiliale();
		const dataPrenotazione = new Date(this.getLocalIsoString());

		// Verifica prenotazioni cliente se refCliente è fornito
		if (refCliente !== null) {
			try {
				const cliResp = await lastValueFrom(
					this.prenotazioneService.getPrenotazioniByCliente(
						refCliente
					)
				);

				if (cliResp.success && cliResp.data?.length) {
					const hasPrenotazioneFutura = cliResp.data.some((p) => {
						const dataEsistente = new Date(p.data_ora_prenotazione);
						return (
							dataEsistente.getTime() >=
							dataPrenotazione.getTime()
						);
					});

					if (hasPrenotazioneFutura) {
						await this.presentToast(
							"Il cliente ha già una prenotazione futura. Non è possibile crearne un'altra.",
							'danger'
						);
						this.showPopup = false;
						this.resetPopup();
						return;
					}
				}
			} catch (e) {
				console.error('Errore controllo prenotazioni cliente:', e);
				await this.presentToast(
					'Errore controllo prenotazioni cliente',
					'danger'
				);
				return;
			}
		}

		const pren: PrenotazioneRequest = {
			numero_persone: numeroPersoneFinale,
			data_ora_prenotazione: this.getLocalIsoString(),
			ref_cliente: refCliente,
			ref_filiale: filialeId,
		};

		if (pren.data_ora_prenotazione === '') {
			await this.presentToast(
				'Non è possibile prenotare in nessuna fascia',
				'danger'
			);
			return;
		}

		try {
			const result = await lastValueFrom(
				this.prenotazioneService.prenotaLoco(pren)
			);
			if (result.success) {
				await this.presentToast(
					'Prenotazione creata con successo',
					'success'
				);
				await this.loadTavoli();
			} else {
				await this.presentToast(
					'Errore nella creazione della prenotazione',
					'danger'
				);
			}
		} catch (err) {
			console.error(err);
			await this.presentToast(
				'Errore, non ci sono abbastanza tavoli disponibili',
				'danger'
			);
		}

		this.showPopup = false;
		this.resetPopup();
		this.loadTavoli();
	}

	getLocalIsoString(): string {
		const fasce = [
			{ inizio: '12:00', fine: '13:30' },
			{ inizio: '13:30', fine: '15:00' },
			{ inizio: '19:30', fine: '21:00' },
			{ inizio: '21:00', fine: '22:30' },
		];

		const now = new Date();

		const toDate = (timeStr: string) => {
			const [hh, mm] = timeStr.split(':').map(Number);
			const d = new Date(now);
			d.setHours(hh, mm, 0, 0);
			return d;
		};

		let fasciaDaPrenotare: (typeof fasce)[0] | null = null;

		for (let i = 0; i < fasce.length; i++) {
			const fascia = fasce[i];
			const inizioFascia = toDate(fascia.inizio);
			const fineFascia = toDate(fascia.fine);

			const prossimaFascia = i + 1 < fasce.length ? fasce[i + 1] : null;
			const inizioProssimaFascia = prossimaFascia
				? toDate(prossimaFascia.inizio)
				: null;

			const dentroFascia = now >= inizioFascia && now <= fineFascia;
			const minutiAllaFine =
				(fineFascia.getTime() - now.getTime()) / 60000;

			// Se siamo dentro la fascia e mancano almeno 30 minuti alla fine
			if (dentroFascia && minutiAllaFine >= 30) {
				fasciaDaPrenotare = fascia;
				break;
			}

			// Se mancano meno di 30 minuti alla fine, salta alla prossima fascia
			if (dentroFascia && minutiAllaFine < 30) {
				continue;
			}

			// Se la fascia deve iniziare a breve (entro 10 minuti), prenota su quella
			if (!dentroFascia && now < inizioFascia) {
				const diffMinuti =
					(inizioFascia.getTime() - now.getTime()) / 60000;
				if (diffMinuti >= 0 && diffMinuti <= 10) {
					fasciaDaPrenotare = fascia;
					break;
				}
			}
		}

		if (!fasciaDaPrenotare) {
			// Nessuna fascia disponibile per la prenotazione
			return '';
		}

		const inizioFasciaPrenotare = toDate(fasciaDaPrenotare.inizio);

		// Restituisce la data ISO locale (senza 'Z' finale)
		const offsetMs = inizioFasciaPrenotare.getTimezoneOffset() * 60000;
		return new Date(inizioFasciaPrenotare.getTime() - offsetMs)
			.toISOString()
			.slice(0, 19);
	}

	annulla() {
		this.showPopup = false;
		this.resetPopup();
	}

	resetPopup() {
		this.personeSelezionate = null;
		this.inputManuale = null;
		this.refClienteInput = '';
	}

	isCliccabile(tavolo: any): boolean {
		return tavolo.stato !== 'senza-ordini';
	}

	handleClick(tavolo: any) {
		if (tavolo.stato === 'attesa-arrivo') {
			this.tavoloDaConfermare = tavolo;
			this.showConfermaArrivoPopup = true;
		} else if (this.isCliccabile(tavolo)) {
			console.log('Hai cliccato sul tavolo:', tavolo);
		}
	}

	async confermaArrivo() {
		if (!this.tavoloDaConfermare) return;
		try {
			const resp = await lastValueFrom(
				this.prenotazioneService.confermaPrenotazione(
					this.tavoloDaConfermare.numero
				)
			);
			await this.presentToast(
				resp.success
					? `Arrivo cliente confermato per tavolo ${this.tavoloDaConfermare.numero}`
					: `Errore conferma arrivo`,
				resp.success ? 'success' : 'danger'
			);
			this.showConfermaArrivoPopup = false;
			this.tavoloDaConfermare = null;
			await this.loadTavoli();
		} catch (e) {
			console.error(e);
			await this.presentToast(
				'Errore durante la conferma arrivo',
				'danger'
			);
		}
	}

	chiudiPopupArrivo() {
		this.showConfermaArrivoPopup = false;
		this.tavoloDaConfermare = null;
	}

	async presentToast(
		messaggio: string,
		color: 'success' | 'danger' | 'warning' = 'success'
	) {
		const toast = await this.toastController.create({
			message: messaggio,
			duration: 2000,
			position: 'bottom',
			color,
		});
		await toast.present();
	}

	filtraPerStato(stato: string | null) {
		this.selectedFilter = stato;
		this.applicaFiltro();
	}

	applicaFiltro() {
		this.tavoliFiltrati = this.selectedFilter
			? this.tavoli.filter((t) => t.stato === this.selectedFilter)
			: [...this.tavoli];
	}
}
