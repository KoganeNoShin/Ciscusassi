import { Component, OnInit, OnDestroy } from '@angular/core';

import { CommonModule } from '@angular/common';

import {
	FormsModule,
	ReactiveFormsModule,
	FormGroup,
	FormBuilder,
	Validators,
} from '@angular/forms';

import { TavoloService } from 'src/app/core/services/tavolo.service';

import {
	IonContent,
	IonGrid,
	IonRow,
	IonCol,
	IonButton,
	IonModal,
	ToastController,
	IonChip,
	IonText,
	IonItem,
	IonInput,
	IonIcon,
	IonSpinner,
} from '@ionic/angular/standalone';

import { AlertController } from '@ionic/angular/standalone';

import { PrenotazioneService } from 'src/app/core/services/prenotazione.service';

import { lastValueFrom } from 'rxjs';

import { PrenotazioneRequest } from 'src/app/core/interfaces/Prenotazione';

import { Router } from '@angular/router';

import { addIcons } from 'ionicons';

import { add } from 'ionicons/icons';

@Component({
	selector: 'app-visualizza-tavoli',

	templateUrl: './visualizza-tavoli-cameriere.page.html',

	styleUrls: ['./visualizza-tavoli-cameriere.page.scss'],

	standalone: true,

	imports: [
		IonSpinner,
		IonInput,
		IonItem,
		IonText,
		IonContent,
		IonGrid,
		IonRow,
		IonCol,
		IonButton,
		IonModal,
		IonChip,
		CommonModule,
		FormsModule,
		IonIcon,
		FormsModule,
		ReactiveFormsModule,
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

	selectedFilter: string | null = null;

	showModaleInserimentoPrenotazione = false;

	personePossibili = [1, 2, 3, 4, 5, 6, 7];

	personeSelezionate: number | null = null;

	inputManuale: number | null = null;

	refClienteInput: number | null = null;

	showModaleConfermaArrivo = false;

	tavoloDaConfermare: any = null;

	localeAperto: boolean = false;

	private intervalTavoli: any;

	private intervalApertura: any;
	error: boolean = false;
	loading: boolean = false;

	formPrenotaLoco: FormGroup = new FormGroup({});

	constructor(
		private toastController: ToastController,
		private prenotazioneService: PrenotazioneService,
		private router: Router,
		private tavoloService: TavoloService,
		private AlertController: AlertController,
		private fb: FormBuilder
	) {
		addIcons({ add });
	}

	/*	Inizializza la pagina: se il locale è aperto carica i tavoli e imposta aggiornamento ogni 30 secondi.

		Avvia anche il controllo ricorrente degli orari di apertura. */

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

		this.formPrenotaLoco = this.fb.group({
			numPersone: ['', [Validators.required, Validators.min(1)]],
			codCarta: ['', [Validators.required, Validators.min(1)]],
		});
		this.formPrenotaLoco.reset();
	}

	// Pulisce gli intervalli temporali per evitare memory leak quando il componente viene distrutto.

	ngOnDestroy(): void {
		this.ionViewWillLeave();
	}

	ionViewWillLeave() {
		if (this.intervalTavoli) {
			clearInterval(this.intervalTavoli);
		}

		if (this.intervalApertura) {
			clearInterval(this.intervalApertura);
		}
	}

	/* 	Controlla se il locale è aperto in base al giorno della settimana e agli orari predefiniti.

	 	Se il locale passa da chiuso ad aperto, carica i tavoli e avvia l'aggiornamento periodico. */

	/**
	 * Controlla se il locale è attualmente aperto in base al giorno della settimana e agli orari di apertura definiti.
	 *
	 * - Il locale è chiuso il martedì (giorno 2 della settimana).
	 * - Negli altri giorni, verifica se l'orario corrente rientra in uno degli intervalli di apertura specificati.
	 *
	 * Se il locale passa da chiuso ad aperto, carica i tavoli e imposta un intervallo per ricaricarli ogni 30 secondi.
	 *
	 * @remarks
	 * La proprietà `localeAperto` viene aggiornata in base allo stato corrente.
	 * La funzione interna `isInRange` gestisce anche il caso in cui l'orario di chiusura sia a mezzanotte.
	 */
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
			this.localeAperto = false;
		} else {
			// Qui definisci gli orari di apertura del locale

			this.localeAperto =
				isInRange(11, 50, 16, 30) || isInRange(19, 20, 0, 0);
		}

		// Se il locale è appena passato da chiuso ad aperto

		if (!eraApertoPrima && this.localeAperto) {
			this.loadTavoli();

			this.intervalTavoli = setInterval(() => this.loadTavoli(), 30000);
		}
	}

	/* 	Carica la lista delle prenotazioni/tavoli dal servizio.

	 	Se il locale è chiuso, svuota la lista.

	 	Per ogni prenotazione recupera lo stato e costruisce l'array di tavoli con info complete.

	 	Applica il filtro attivo sui tavoli caricati. */

	/**
	 * Carica la lista dei tavoli per il cameriere in base alle prenotazioni del giorno corrente.
	 *
	 * - Se il locale è chiuso (`localeAperto` è `false`), svuota le liste dei tavoli e termina.
	 * - Altrimenti, imposta lo stato di caricamento e recupera le prenotazioni del giorno tramite il servizio `prenotazioneService`.
	 * - Per ogni prenotazione, recupera lo stato attuale della prenotazione e costruisce un oggetto tavolo con i dettagli rilevanti.
	 * - In caso di errore nel recupero dello stato della prenotazione, imposta lo stato su `'attesa'`.
	 * - Aggiorna le liste `tavoli` e applica eventuali filtri.
	 * - Gestisce eventuali errori globali impostando lo stato di errore e svuotando le liste.
	 *
	 * @returns {Promise<void>} Una Promise che si risolve al termine del caricamento dei tavoli.
	 */
	async loadTavoli() {
		if (!this.localeAperto) {
			// Non carichiamo tavoli se il locale è chiuso

			this.tavoli = [];

			this.tavoliFiltrati = [];

			return;
		}

		this.loading = true;
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

				this.applicaFiltroTavoli();
			} else {
				this.tavoli = [];

				this.tavoliFiltrati = [];
			}
		} catch (e) {
			console.error('Errore caricamento tavoli:', e);
			this.error = true;

			this.tavoli = [];

			this.tavoliFiltrati = [];
		}
		this.loading = false;
	}

	// 	Formattta una data ISO in una stringa HH:mm per visualizzare l'orario della prenotazione.

	/**
	 * Formatta una stringa di data e ora in una rappresentazione oraria "HH:mm".
	 *
	 * @param dataOra - La stringa che rappresenta la data e l'ora da formattare.
	 * @returns Una stringa contenente solo l'orario nel formato "HH:mm".
	 */
	formattaOrario(dataOra: string): string {
		const d = new Date(dataOra);

		return `${d.getHours().toString().padStart(2, '0')}:${d

			.getMinutes()

			.toString()

			.padStart(2, '0')}`;
	}

	/* 	Mostra il ModaleInserimentoPrenotazionechiudiModaleInserimentoPrenotazione per aggiungere una nuova prenotazione solo se il locale è aperto.

	 	Altrimenti mostra un messaggio di avviso. */

	/**
	 * Mostra il modale per l'aggiunta di una nuova prenotazione.
	 *
	 * Se il locale non è aperto, viene mostrato un messaggio di avviso tramite toast
	 * e l'operazione viene interrotta. In caso contrario, viene visualizzato il modale
	 * per l'inserimento della prenotazione e successivamente viene chiamato il metodo
	 * per chiudere il modale di inserimento prenotazione.
	 *
	 * @remarks
	 * Questo metodo gestisce sia la visualizzazione del modale che la logica di controllo
	 * sullo stato di apertura del locale.
	 */
	visualizzaModaleAggiungiPrenotazione() {
		if (!this.localeAperto) {
			this.presentToast(
				'Il locale è chiuso, non è possibile aggiungere prenotazioni.',

				'warning'
			);

			return;
		}

		this.showModaleInserimentoPrenotazione = true;

		this.chiudiModaleInserimentoPrenotazione();
	}

	// 	Seleziona un numero predefinito di persone per la prenotazione.

	/**
	 * Seleziona il numero di persone per il tavolo.
	 *
	 * @param n - Il numero di persone selezionato dall'utente.
	 * Imposta sia la variabile `personeSelezionate` che `inputManuale` al valore fornito.
	 */
	selezionaPersone(n: number) {
		this.personeSelezionate = n;

		this.inputManuale = n;
	}

	// 	Aggiorna la selezione del numero di persone in base all'input manuale, solo se valido.

	/**
	 * Gestisce il cambiamento dell'input manuale relativo al numero di persone.
	 *
	 * Se il valore inserito manualmente (`inputManuale`) non è nullo e si trova tra i valori possibili (`personePossibili`),
	 * allora aggiorna il numero di persone selezionate (`personeSelezionate`) con il valore inserito.
	 * Altrimenti, imposta `personeSelezionate` a null.
	 */
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

	/* 	Conferma la creazione di una nuova prenotazione.

	 	Valida input persone e ref cliente.

	 	Verifica prenotazioni future esistenti per il cliente. */

	/**
	 * Mostra un alert di conferma all'utente quando la fascia oraria selezionata non è disponibile.
	 *
	 * L'alert presenta due opzioni:
	 * - "Annulla": l'utente annulla l'operazione e la Promise viene risolta con `false`.
	 * - "Conferma": l'utente accetta di prenotare per la prossima fascia disponibile e la Promise viene risolta con `true`.
	 *
	 * @returns {Promise<boolean>} Una Promise che si risolve con `true` se l'utente conferma, `false` se annulla.
	 */
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

						cssClass: [
							'alert-button-cancel',
							'bg-color-rosso',
							'text-color-bianco',
						],
					},

					{
						text: 'Conferma',

						handler: () => resolve(true),

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
		});
	}

	/**
	 * Conferma l'inserimento di una nuova prenotazione tramite modale.
	 *
	 * Questa funzione gestisce la validazione dei dati inseriti dall'utente per la prenotazione,
	 * tra cui il numero di persone e il numero della carta cliente. Esegue i seguenti controlli:
	 * - Verifica che il numero di persone sia valido e non superiore a 20.
	 * - Verifica che il numero della carta cliente sia presente e positivo.
	 * - Controlla se il cliente ha già una prenotazione futura.
	 * - Gestisce eventuali errori di rete o di validazione, mostrando messaggi di toast appropriati.
	 * - Se tutti i controlli sono superati, invia la richiesta di prenotazione tramite il servizio dedicato.
	 * - Aggiorna la lista dei tavoli disponibili dopo la prenotazione.
	 *
	 * @async
	 * @returns {Promise<void>} Nessun valore di ritorno.
	 */
	async confermaModaleInserimentoPrenotazione() {
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

		// ✅ VALIDAZIONE OBBLIGATORIA CAMPO refClienteInput

		if (!this.refClienteInput) {
			await this.presentToast(
				'Il numero della carta cliente è obbligatorio.',

				'warning'
			);

			return;
		}

		if (this.refClienteInput < 0) {
			await this.presentToast(
				'Il numero della carta cliente deve essere positivo.',

				'warning'
			);

			return;
		}

		let dataPrenotazione = this.getLocalIsoString();
		refCliente = this.refClienteInput;

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

						this.showModaleInserimentoPrenotazione = false;

						this.chiudiModaleInserimentoPrenotazione();

						return;
					}
				}
			} catch (e: any) {
				console.error('Errore: per favore riprova più tardi', e);

				await this.presentToast(
					'Errore: per favore riprova più tardi',

					'danger'
				);

				if (e?.status === 400) {
					await this.presentToast(
						'Errore: numero carta non trovato',
						'danger'
					);
				}

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

			ref_cliente: refCliente!,
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

		this.showModaleInserimentoPrenotazione = false;

		this.chiudiModaleInserimentoPrenotazione();

		this.loadTavoli();
	}

	/**
	 * Restituisce una stringa formattata localmente che rappresenta l'inizio della fascia oraria corrente o della prossima fascia,
	 * in base all'orario attuale e al parametro `forceNextFascia`.
	 *
	 * Le fasce orarie sono predefinite e rappresentano intervalli di tempo durante la giornata.
	 * Se l'orario attuale ricade all'interno di una fascia e sono passati al massimo 10 minuti dall'inizio,
	 * viene restituito l'inizio di quella fascia. Se ci si trova a meno di 10 minuti dall'inizio di una fascia futura,
	 * viene restituito l'inizio di quella fascia.
	 * Se `forceNextFascia` è true, viene restituito l'inizio della prossima fascia oraria disponibile.
	 *
	 * @param forceNextFascia - Se true, forza la restituzione dell'inizio della prossima fascia oraria.
	 * @returns Una stringa nel formato "YYYY-MM-DD HH:mm" che rappresenta l'inizio della fascia selezionata, oppure una stringa vuota se nessuna fascia è valida.
	 */
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

	/**
	 * Converte un oggetto Date in una stringa formattata secondo il formato locale "YYYY-MM-DD HH:mm".
	 *
	 * @param date - L'oggetto Date da convertire.
	 * @returns Una stringa che rappresenta la data e l'ora nel formato "YYYY-MM-DD HH:mm".
	 */
	toLocalISOString(date: Date): string {
		const year = date.getFullYear();

		const month = String(date.getMonth() + 1).padStart(2, '0');

		const day = String(date.getDate()).padStart(2, '0');

		const hours = String(date.getHours()).padStart(2, '0');

		const minutes = String(date.getMinutes()).padStart(2, '0');

		return `${year}-${month}-${day} ${hours}:${minutes}`;
	}

	/**
	 * Annulla e chiude la modale di inserimento prenotazione.
	 *
	 * Imposta la variabile `showModaleInserimentoPrenotazione` a `false` per nascondere la modale
	 * e richiama il metodo `chiudiModaleInserimentoPrenotazione()` per eseguire eventuali operazioni aggiuntive di chiusura.
	 */
	annullaModaleInserimentoPrenotazione() {
		this.showModaleInserimentoPrenotazione = false;

		this.chiudiModaleInserimentoPrenotazione();
	}

	/**
	 * Chiude la modale di inserimento prenotazione e resetta i campi correlati.
	 *
	 * Imposta la variabile `showModaleConfermaArrivo` a `false` per nascondere la modale,
	 * e azzera le variabili `personeSelezionate`, `inputManuale` e `refClienteInput`
	 * per pulire i dati inseriti precedentemente.
	 */
	chiudiModaleInserimentoPrenotazione() {
		this.showModaleConfermaArrivo = false;

		this.personeSelezionate = null;

		this.inputManuale = null;

		this.refClienteInput = null;
	}

	/**
	 * Gestisce il click su un tavolo nella lista dei tavoli.
	 *
	 * @param tavolo L'oggetto rappresentante il tavolo selezionato.
	 *
	 * Se lo stato del tavolo è 'attesa-arrivo', imposta il tavolo come tavolo da confermare
	 * e mostra il modale di conferma arrivo.
	 * Se lo stato del tavolo è diverso da 'senza-ordini', imposta il tavolo selezionato
	 * nel servizio e naviga alla pagina di visualizzazione ordini del cameriere.
	 */
	handleClick(tavolo: any) {
		if (tavolo.stato === 'attesa-arrivo') {
			this.tavoloDaConfermare = tavolo;

			this.showModaleConfermaArrivo = true;
		} else if (tavolo.stato !== 'senza-ordini') {
			console.log('Hai cliccato sul tavolo:', tavolo);

			this.tavoloService.setTavolo(tavolo);

			this.router.navigate(['/visualizza-ordini-cameriere']);
		}
	}

	/**
	 * Conferma l'arrivo di un cliente associato al tavolo selezionato.
	 *
	 * Questa funzione verifica se è presente un tavolo da confermare. Se presente,
	 * invia una richiesta di conferma prenotazione tramite il servizio `prenotazioneService`.
	 * Mostra un messaggio di successo o errore tramite un toast a seconda dell'esito dell'operazione.
	 * Alla fine, chiude la modale di conferma arrivo, azzera il tavolo selezionato
	 * e ricarica la lista dei tavoli. In caso di errore durante la richiesta,
	 * viene mostrato un messaggio di errore.
	 *
	 * @returns {Promise<void>} Una Promise che si risolve quando tutte le operazioni sono completate.
	 */
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

			this.showModaleConfermaArrivo = false;

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

	/**
	 * Chiude la modale di conferma arrivo.
	 *
	 * Imposta la variabile `showModaleConfermaArrivo` a `false` per nascondere la modale
	 * e resetta la variabile `tavoloDaConfermare` a `null`.
	 */
	chiudiModaleConfermaArrivo() {
		this.showModaleConfermaArrivo = false;

		this.tavoloDaConfermare = null;
	}

	/**
	 * Mostra un toast con un messaggio specificato e un colore opzionale.
	 *
	 * @param messaggio - Il messaggio da visualizzare nel toast.
	 * @param color - Il colore del toast ('success', 'danger' o 'warning'). Il valore predefinito è 'success'.
	 * @returns Una Promise che si risolve quando il toast è stato presentato.
	 */
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

	/**
	 * Imposta il filtro selezionato per lo stato dei tavoli.
	 * Se lo stato passato è undefined o vuoto, il filtro viene resettato (null).
	 * Successivamente applica il filtro aggiornato alla lista dei tavoli chiamando `applicaFiltroTavoli`.
	 *
	 * @param stato - Lo stato da filtrare, opzionale. Se non specificato, il filtro viene resettato.
	 */
	filtraTavoliPerStato(stato?: string) {
		this.selectedFilter = stato || null;

		this.applicaFiltroTavoli();
	}

	/**
	 * Applica il filtro alla lista dei tavoli basandosi sul valore di `selectedFilter`.
	 * Se `selectedFilter` è valorizzato, filtra i tavoli mantenendo solo quelli con stato corrispondente.
	 * Altrimenti, mostra tutti i tavoli senza alcun filtro.
	 */
	applicaFiltroTavoli() {
		this.tavoliFiltrati = this.selectedFilter
			? this.tavoli.filter((t) => t.stato === this.selectedFilter)
			: [...this.tavoli];
	}
}
