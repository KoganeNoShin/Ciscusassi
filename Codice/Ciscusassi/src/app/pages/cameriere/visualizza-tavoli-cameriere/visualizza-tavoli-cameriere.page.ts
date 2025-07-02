import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tavolo, TavoloService } from 'src/app/core/services/tavolo.service';

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
import { AlertController } from '@ionic/angular/standalone';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { PrenotazioneService } from 'src/app/core/services/prenotazione.service';
import { lastValueFrom } from 'rxjs';
import { PrenotazioneRequest } from 'src/app/core/interfaces/Prenotazione';
import { Router } from '@angular/router';

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
		prenotazione: number;
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
		private prenotazioneService: PrenotazioneService,
		private router: Router,
		private tavoloService: TavoloService,
		private AlertController: AlertController
	) {}

	// Inizializza la pagina: se il locale è aperto carica i tavoli e imposta aggiornamento ogni 30 secondi.
	// Avvia anche il controllo ricorrente degli orari di apertura.
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
	// Pulisce gli intervalli temporali per evitare memory leak quando il componente viene distrutto.
	ngOnDestroy(): void {
		if (this.intervalTavoli) {
			clearInterval(this.intervalTavoli);
		}
		if (this.intervalApertura) {
			clearInterval(this.intervalApertura);
		}
	}
	// Controlla se il locale è aperto in base al giorno della settimana e agli orari predefiniti.
	// Se il locale passa da chiuso ad aperto, carica i tavoli e avvia l'aggiornamento periodico.
	checkOrariApertura() {
		const now = new Date();
		const giornoSettimana = now.getDay(); // 0=Dom, 1=Lun, 2=Mar, ..., 6=Sab

		const isInRange = (
			startH: number,
			startM: number,
			endH: number,
			endM: number
		): boolean => {
			const start = new Date(now);
			start.setHours(startH, startM, 0, 0);

			const end = new Date(now);
			if (endH === 0 && endM === 0) {
				// Se fine è mezzanotte, consideriamo il giorno dopo
				end.setDate(end.getDate() + 1);
				end.setHours(0, 0, 0, 0);
			} else {
				end.setHours(endH, endM, 0, 0);
			}

			return now >= start && now <= end;
		};

		const eraApertoPrima = this.localeAperto;

		// Locale chiuso il martedì (giorno 2)
		if (giornoSettimana === 2) {
			this.localeAperto = true; //DA CAMBIARE IN FALSE
		} else {
			// Qui definisci gli orari di apertura del locale
			// Esempio: aperto sempre (00:00-23:59) oppure aperto solo dalle 19:20 a mezzanotte
			this.localeAperto =
				isInRange(0, 0, 23, 59) || isInRange(19, 20, 0, 0);
		}

		// Se il locale è appena passato da chiuso ad aperto
		if (!eraApertoPrima && this.localeAperto) {
			this.loadTavoli();
			this.intervalTavoli = setInterval(() => this.loadTavoli(), 30000);
		}
	}
	// Carica la lista delle prenotazioni/tavoli dal servizio.
	// Se il locale è chiuso, svuota la lista.
	// Per ogni prenotazione recupera lo stato e costruisce l'array di tavoli con info complete.
	// Applica il filtro attivo sui tavoli caricati.
	async loadTavoli() {
		if (!this.localeAperto) {
			// Non carichiamo tavoli se il locale è chiuso
			this.tavoli = [];
			this.tavoliFiltrati = [];
			return;
		}

		try {
			const resp = await lastValueFrom(
				this.prenotazioneService.getPrenotazioniDelGiornoFiliale()
			);

			if (resp.success && resp.data?.length) {
				const tavoliComp = await Promise.all(
					resp.data.map(async (p) => {
						try {
							const statoResp = await lastValueFrom(
								this.prenotazioneService.getStatoPrenotazioneCameriere(
									p.id_prenotazione
								)
							);
							return {
								numero: p.ref_torretta,
								prenotazione: p.id_prenotazione,
								orario: this.formattaOrario(
									p.data_ora_prenotazione
								),
								persone: p.numero_persone,
								stato: statoResp.data ?? 'attesa',
							};
						} catch (e) {
							console.error(e);
							return {
								numero: p.ref_torretta,
								prenotazione: p.id_prenotazione,
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
	// Formattta una data ISO in una stringa HH:mm per visualizzare l'orario della prenotazione.
	formattaOrario(dataOra: string): string {
		const d = new Date(dataOra);
		return `${d.getHours().toString().padStart(2, '0')}:${d
			.getMinutes()
			.toString()
			.padStart(2, '0')}`;
	}
	// Mostra il popup per aggiungere una nuova prenotazione solo se il locale è aperto.
	// Altrimenti mostra un messaggio di avviso.
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
	// Seleziona un numero predefinito di persone per la prenotazione.
	selezionaPersone(n: number) {
		this.personeSelezionate = n;
		this.inputManuale = n;
	}
	// Aggiorna la selezione del numero di persone in base all'input manuale, solo se valido.
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
	// Conferma la creazione di una nuova prenotazione.
	// Valida input persone e ref cliente.
	// Verifica prenotazioni future esistenti per il cliente.
	async mostraConfermaFasciaOraria(): Promise<boolean> {
		return new Promise(async (resolve) => {
			const alert = await this.AlertController.create({
				header: 'Fascia oraria non disponibile',
				message: 'Vuoi prenotare per la prossima fascia disponibile?',
				buttons: [
					{
						text: 'Annulla',
						role: 'cancel',
						handler: () => resolve(false),
					},
					{
						text: 'Conferma',
						handler: () => resolve(true),
					},
				],
			});
			await alert.present();
		});
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

		const MAX_PERSONE = 999999;
		const numeroPersoneFinale = Math.min(persone, MAX_PERSONE);

		// Controllo massimo 20 persone
		if (numeroPersoneFinale > 20) {
			await this.presentToast(
				'Una prenotazione può avere al massimo 20 persone',
				'danger'
			);
			return;
		}

		// Calcolo tavoli richiesti
		let numeroTavoliRichiesti = 0;
		for (let t = 1; t <= numeroPersoneFinale; t++) {
			if (2 * t + 2 >= numeroPersoneFinale) {
				numeroTavoliRichiesti = t;
				break;
			}
		}

		if (this.refClienteInput?.trim() !== '') {
			const parsed = parseInt(this.refClienteInput.trim(), 10);
			if (!isNaN(parsed)) {
				refCliente = parsed;
			} else {
				await this.presentToast('ref_cliente non valido', 'warning');
				return;
			}
		}

		const filialeId = this.authService.getFiliale();
		let dataPrenotazione = this.getLocalIsoString();

		if (refCliente !== null) {
			try {
				const cliResp = await lastValueFrom(
					this.prenotazioneService.getPrenotazioniByClienteCameriere(
						refCliente
					)
				);

				if (cliResp.success && cliResp.data?.length) {
					const hasPrenotazioneFutura = cliResp.data.some((p) => {
						const dataEsistente = new Date(p.data_ora_prenotazione);
						return (
							dataEsistente.getTime() >=
							new Date(dataPrenotazione).getTime()
						);
					});

					if (hasPrenotazioneFutura) {
						await this.presentToast(
							'Il cliente ha già una prenotazione futura.',
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

		if (dataPrenotazione === '') {
			const conferma = await this.mostraConfermaFasciaOraria();
			if (!conferma) {
				return;
			}
			dataPrenotazione = this.getLocalIsoString(true);

			if (dataPrenotazione === '') {
				await this.presentToast(
					'Non ci sono fasce disponibili per la prenotazione.',
					'danger'
				);
				return;
			}
		}

		const pren: PrenotazioneRequest = {
			numero_persone: numeroPersoneFinale,
			data_ora_prenotazione: dataPrenotazione,
			...(refCliente !== null ? { ref_cliente: refCliente } : {}),
		};

		try {
			this.prenotazioneService.prenotaLoco(pren).subscribe({
				next: async (res) => {
					if (res.success) {
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
				},
				error: async (err) => {
					console.error('Errore nella prenotazione:', err);
					if (refCliente !== null) {
						await this.presentToast(
							'Il cliente risulta già prenotato',
							'danger'
						);
					} else {
						await this.presentToast(
							'Non ci sono abbastanza tavoli disponibili',
							'danger'
						);
					}
				},
			});
		} catch (e) {
			console.error('Errore nella prenotazione:', e);
			await this.presentToast(
				'Errore durante la creazione della prenotazione',
				'danger'
			);
		}

		this.showPopup = false;
		this.resetPopup();
		this.loadTavoli();
	}

	getLocalIsoString(forceNextFascia: boolean = false): string {
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

		// Funzione per formattare la data nel formato "YYYY-MM-DD HH:mm"
		const toLocalFormattedString = (date: Date): string => {
			const pad = (n: number) => n.toString().padStart(2, '0');

			const year = date.getFullYear();
			const month = pad(date.getMonth() + 1); // Mese da 0-11
			const day = pad(date.getDate());
			const hours = pad(date.getHours());
			const minutes = pad(date.getMinutes());

			return `${year}-${month}-${day} ${hours}:${minutes}`;
		};

		for (let i = 0; i < fasce.length; i++) {
			const fascia = fasce[i];
			const inizioFascia = toDate(fascia.inizio);
			const fineFascia = toDate(fascia.fine);

			const prossimaFascia = i + 1 < fasce.length ? fasce[i + 1] : null;
			const inizioProssima = prossimaFascia
				? toDate(prossimaFascia.inizio)
				: null;

			const minutiInizio =
				(now.getTime() - inizioFascia.getTime()) / 60000;
			const dentroFascia = now >= inizioFascia && now <= fineFascia;

			if (!forceNextFascia) {
				if (dentroFascia && minutiInizio <= 10) {
					return toLocalFormattedString(inizioFascia);
				}
				if (!dentroFascia && now < inizioFascia) {
					const diffMinuti =
						(inizioFascia.getTime() - now.getTime()) / 60000;
					if (diffMinuti >= 0 && diffMinuti <= 10) {
						return toLocalFormattedString(inizioFascia);
					}
				}
			} else if (
				forceNextFascia &&
				prossimaFascia &&
				now < inizioProssima!
			) {
				return toLocalFormattedString(inizioProssima!);
			}
		}

		return '';
	}

	toLocalISOString(date: Date): string {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
		return `${year}-${month}-${day} ${hours}:${minutes}`;
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
			this.tavoloService.setTavolo(tavolo);
			this.router.navigate(['/visualizza-ordini-cameriere']);
		}
	}

	async confermaArrivo() {
		if (!this.tavoloDaConfermare) return;
		try {
			const resp = await lastValueFrom(
				this.prenotazioneService.confermaPrenotazione(
					this.tavoloDaConfermare.prenotazione
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
