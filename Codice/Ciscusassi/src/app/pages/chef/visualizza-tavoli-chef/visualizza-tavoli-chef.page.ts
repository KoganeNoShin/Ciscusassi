import { Component, OnInit, OnDestroy } from '@angular/core'; // Aggiunto OnDestroy
import { CommonModule } from '@angular/common';
import {
	IonContent,
	IonGrid,
	IonRow,
	IonCol,
	IonChip,
	ToastController,
	IonText,
	IonSpinner,
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
		IonSpinner,
		IonContent,
		IonGrid,
		IonRow,
		IonCol,
		IonChip,
		CommonModule,
		IonText,
	],
})
export class VisualizzaTavoliChefPage implements OnInit, OnDestroy {
	tavoli: Array<{
		numero: number;
		prenotazione: number;
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

	localeAperto: boolean = false;
	private intervalTavoli: any;
	private intervalApertura: any;

	error: boolean = false;
	loading: boolean = false;

	constructor(
		private toastController: ToastController,
		private authService: AuthenticationService,
		private prenotazioneService: PrenotazioneService,
		private tavoloService: TavoloService,
		private router: Router
	) {}

	/**
	 * Metodo chiamato all'inizializzazione del componente.
	 *
	 * Se il locale è aperto, carica la lista dei tavoli e imposta un intervallo
	 * per aggiornarla ogni 30 secondi.
	 * Inoltre, verifica gli orari di apertura e imposta un intervallo per
	 * controllarli ogni 30 secondi.
	 */
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
		this.ionViewWillLeave();
	}

	/**
	 * Metodo chiamato quando la vista sta per essere abbandonata.
	 *
	 * Pulisce gli eventuali intervalli impostati per il caricamento dei tavoli
	 * e il controllo degli orari di apertura, per evitare perdite di memoria
	 * e chiamate non necessarie dopo l'uscita dalla pagina.
	 */
	ionViewWillLeave() {
		if (this.intervalTavoli) {
			clearInterval(this.intervalTavoli);
		}

		if (this.intervalApertura) {
			clearInterval(this.intervalApertura);
		}
	}

	/**
	 * Controlla se il locale è aperto in base all'orario corrente.
	 *
	 * Usa una funzione interna isInRange per determinare se l'ora attuale
	 * rientra in uno degli intervalli di apertura previsti.
	 *
	 * La proprietà localeAperto viene aggiornata di conseguenza.
	 *
	 * Se il locale è appena passato da chiuso ad aperto, carica i tavoli
	 * e avvia un intervallo per ricaricarli ogni 30 secondi.
	 *
	 * NOTA: Al momento è impostato un intervallo di apertura fittizio (00:00-23:59
	 * e 19:20-00:00). È previsto inserire la chiusura del martedì.
	 */
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

		this.localeAperto = isInRange(0, 0, 23, 59) || isInRange(19, 20, 0, 0); //DA MODIFICARE

		//INSERIRE MARTEDI CHIUSI

		// Se il locale è appena passato da chiuso ad aperto
		if (!eraApertoPrima && this.localeAperto) {
			this.loadTavoli();
			this.intervalTavoli = setInterval(() => this.loadTavoli(), 30000);
		}
	}

	/**
	 * Carica le prenotazioni del giorno per la filiale corrente e aggiorna la lista dei tavoli.
	 *
	 * Per ogni prenotazione recupera lo stato attuale tramite chiamata al servizio prenotazioni.
	 * Costruisce un array di tavoli con i dettagli:
	 *  - numero torretta
	 *  - id prenotazione
	 *  - orario formattato
	 *  - numero persone
	 *  - stato della prenotazione (di default "in-lavorazione" in caso di errore)
	 *
	 * Applica successivamente un filtro sui tavoli caricati.
	 * Gestisce gli stati di caricamento e errori.
	 *
	 * In caso di errore o assenza di prenotazioni, svuota le liste tavoli e segnala l'errore.
	 */
	async loadTavoli() {
		this.loading = true;
		try {
			const filiale = this.authService.getFiliale();
			const response = await lastValueFrom(
				this.prenotazioneService.getPrenotazioniDelGiornoFiliale()
			);

			if (response.success && response.data?.length) {
				const prenotazioniFiltrate = response.data;

				const tavoliCompletati = await Promise.all(
					prenotazioniFiltrate.map(async (p) => {
						try {
							const statoResponse = await lastValueFrom(
								this.prenotazioneService.getStatoPrenotazioneChef(
									p.id_prenotazione
								)
							);
							const stato =
								statoResponse?.data ?? 'in-lavorazione';

							return {
								numero: p.ref_torretta,
								prenotazione: p.id_prenotazione,
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
								prenotazione: p.id_prenotazione,
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
			this.tavoli = [];
			this.tavoliFiltrati = [];
			this.error = true;
		}
		this.loading = false;
	}

	/**
	 * Formattta una stringa data/ora in formato "HH:mm".
	 *
	 * @param dataOra - Stringa rappresentante una data e ora (ISO o simile).
	 * @returns Una stringa formattata con ore e minuti, ciascuno a due cifre.
	 */
	formattaOrario(dataOra: string): string {
		const data = new Date(dataOra);
		const ora = data.getHours().toString().padStart(2, '0');
		const minuti = data.getMinutes().toString().padStart(2, '0');
		return `${ora}:${minuti}`;
	}

	/**
	 * Mostra un toast con un messaggio personalizzato.
	 *
	 * @param messaggio - Testo da visualizzare nel toast.
	 * @param colore - Colore del toast, può essere 'success' o 'danger'. Default è 'success'.
	 */
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

	/**
	 * Imposta il filtro selezionato in base allo stato e applica il filtro alla lista dei tavoli.
	 *
	 * @param stato - Lo stato da utilizzare come filtro per i tavoli.
	 */
	filtraTavoliPerStato(stato: string) {
		this.selectedFilter = stato;
		this.applicaFiltro();
	}

	/**
	 * Applica il filtro selezionato alla lista dei tavoli.
	 * Se il filtro è 'tutti', mostra solo i tavoli con stato 'in-lavorazione' o 'non-in-lavorazione'.
	 * Altrimenti, filtra i tavoli mostrando solo quelli con lo stato corrispondente al filtro selezionato.
	 */
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

	/**
	 * Gestisce il click su un tavolo.
	 * Imposta il tavolo selezionato nel servizio dedicato e naviga alla pagina di visualizzazione degli ordini per chef.
	 *
	 * @param tavolo - L'oggetto tavolo selezionato dall'utente.
	 */
	handleClick(tavolo: any) {
		this.tavoloService.setTavolo(tavolo);
		this.router.navigate(['/visualizza-ordini-chef']);
	}
}
