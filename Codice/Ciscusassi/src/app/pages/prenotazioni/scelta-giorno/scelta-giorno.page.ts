import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilialeRecord } from 'src/app/core/interfaces/Filiale';
import { PrenotazioneService } from 'src/app/core/services/prenotazione.service';
import { FilialeService } from 'src/app/core/services/filiale.service';
import { ApiResponse } from 'src/app/core/interfaces/ApiResponse';
import { take } from 'rxjs/operators';
import {
	PrenotazioneRequest,
	PrenotazioneWithFiliale,
} from 'src/app/core/interfaces/Prenotazione';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import {
	IonContent,
	IonSpinner,
	IonDatetime,
	IonRow,
	IonCol,
	IonButton,
	IonGrid,
	IonText,
	NavController,
} from '@ionic/angular/standalone';

@Component({
	selector: 'app-scelta-giorno',
	templateUrl: './scelta-giorno.page.html',
	styleUrls: ['./scelta-giorno.page.scss'],
	standalone: true,
	imports: [
		IonText,
		IonGrid,
		IonButton,
		IonCol,
		IonRow,
		IonDatetime,
		IonSpinner,
		IonContent,
		CommonModule,
		FormsModule,
	],
})

export class SceltaGiornoPage implements OnInit {
	
	filiale: FilialeRecord | null = null;
	dataSelezionata: string = '';
	idFiliale: number = 0;
	loading: boolean = false;
	hasError: boolean = false;
	primaFasciaNonDisponibile: boolean = true;
	secondaFasciaNonDisponibile: boolean = true;
	terzaFasciaNonDisponibile: boolean = true;
	quartaFasciaNonDisponibile: boolean = true;
	persone: number | null = null;
	prenotazione: PrenotazioneRequest = {
		numero_persone: 0,
		data_ora_prenotazione: '',
		ref_filiale: 0,
	};
	prenotazioni: PrenotazioneWithFiliale[] = [];

	constructor(
		private prenotazioneService: PrenotazioneService,
		private filialeService: FilialeService,
		private toastController: ToastController,
		private router: Router,
		private navController: NavController
	) {}

	ngOnInit() {
		this.idFiliale = this.prenotazioneService.getFilialeId();
		console.log('ID filiale caricato:', this.idFiliale);

		if (new Date(Date.now()).getDay() === 2) {
			this.dataSelezionata = this.formatDateToYYYYMMDD(
				Date.now() + 1 * 24 * 60 * 60 * 1000
			);
		} else {
			this.dataSelezionata = this.formatDateToYYYYMMDD(Date.now());
		}

		if (!this.idFiliale) {
			console.error('ID filiale non valido!');
		}

		this.loadFiliale();

		this.persone = this.prenotazioneService.getNumeroPosti();
		console.log('Numero persone caricato:', this.persone);
	}

	/**
	 * Carica la lista delle filiali tramite il servizio `filialeService`.
	 * Imposta lo stato di caricamento e gestisce eventuali errori.
	 * Alla ricezione della risposta, delega la gestione a `handleResponse`.
	 * In caso di errore nella chiamata, imposta `hasError` a true e disabilita lo stato di caricamento.
	 */
	private loadFiliale() {
		this.loading = true;
		this.hasError = false;

		this.filialeService
			.GetSedi()
			.pipe(take(1))
			.subscribe({
				next: (response) => this.handleResponse(response),
				error: (err) => {
					console.error('Errore chiamata GetSedi:', err);
					this.loading = false;
					this.hasError = true;
				},
			});
	}

	/**
	 * Gestisce la risposta dell'API per il recupero delle filiali.
	 *
	 * Imposta lo stato di caricamento a falso e verifica se la risposta è andata a buon fine
	 * e contiene un array di filiali. Se trova la filiale corrispondente all'id specificato,
	 * la assegna alla proprietà `filiale`, azzera eventuali errori e richiama il metodo `alCambioData`.
	 * In caso contrario, segnala un errore e imposta `hasError` a true.
	 * Se la risposta non è valida, logga l'errore e imposta `hasError` a true.
	 *
	 * @param response La risposta dell'API contenente un array di record di filiale.
	 */
	private handleResponse(response: ApiResponse<FilialeRecord[]>): void {
		this.loading = false;

		if (response.success && Array.isArray(response.data)) {
			const filiale = response.data.find(
				(f) => f.id_filiale === this.idFiliale
			);

			if (filiale) {
				this.filiale = filiale;
				this.hasError = false;

				this.alCambioData();
			} else {
				console.error('Filiale non trovata con id:', this.idFiliale);
				this.hasError = true;
			}
		} else {
			console.error(
				'Errore nella risposta GetSedi:',
				response.message || 'Errore sconosciuto'
			);
			this.hasError = true;
		}
	}

	/**
	 * Verifica se una data fornita come stringa soddisfa le seguenti condizioni:
	 * - Non è un martedì.
	 * - È compresa tra oggi (incluso) e le prossime due settimane (incluso).
	 *
	 * @param dateString - La data da verificare, in formato stringa compatibile con il costruttore di `Date`.
	 * @returns `true` se la data non è un martedì e rientra nell'intervallo specificato, altrimenti `false`.
	 */
	noMartediEMaxDueSettimane = (dateString: string): boolean => {
		const d = new Date(dateString);
		const oggi = new Date();
		const giorno = d.getDay();

		oggi.setHours(0, 0, 0, 0);
		const dueSettimane = new Date(oggi);
		dueSettimane.setDate(oggi.getDate() + 14);
		d.setHours(0, 0, 0, 0);

		return (
			giorno !== 2 &&
			d.getTime() >= oggi.getTime() &&
			d.getTime() <= dueSettimane.getTime()
		);
	};

	/**
	 * Converte una data fornita come stringa o numero in una stringa nel formato 'YYYY-MM-DD'.
	 *
	 * @param dateInput - La data da formattare, accettata come stringa o numero.
	 * @returns La data formattata come stringa 'YYYY-MM-DD'. Restituisce una stringa vuota se la data non è valida.
	 */
	formatDateToYYYYMMDD(dateInput: string | number): string {
		const date = new Date(dateInput);
		if (isNaN(date.getTime())) {
			console.error('Data non valida:', dateInput);
			return '';
		}

		const pad = (n: number) => n.toString().padStart(2, '0');
		return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
			date.getDate()
		)}`;
	}

	/**
	 * Gestisce il cambio della data selezionata per la prenotazione.
	 *
	 * - Verifica che una data sia stata selezionata e la formatta nel formato 'YYYY-MM-DD'.
	 * - Controlla la presenza degli identificativi necessari per la filiale e la data.
	 * - Imposta tutte le fasce orarie come non disponibili inizialmente.
	 * - Richiede al servizio `prenotazioneService` i tavoli già in uso per la data selezionata.
	 * - Per ciascuna fascia oraria (12:00, 13:30, 19:30, 21:00), verifica la disponibilità dei tavoli:
	 *   - Se il numero di tavoli disponibili è sufficiente rispetto a quelli richiesti, la fascia viene abilitata.
	 * - Gestisce eventuali errori nella richiesta HTTP.
	 *
	 * @remarks
	 * Questo metodo viene tipicamente chiamato quando l'utente seleziona una nuova data nel processo di prenotazione.
	 */
	alCambioData() {
		console.log('Data selezionata (raw):', this.dataSelezionata);

		if (!this.dataSelezionata) {
			console.warn('Data non selezionata!');
			return;
		}

		const dataFormattata = this.formatDateToYYYYMMDD(this.dataSelezionata);
		this.dataSelezionata = dataFormattata;

		if (!this.idFiliale || !this.dataSelezionata) {
			console.error('Parametri mancanti per tavoliInUso');
			return;
		}

		this.primaFasciaNonDisponibile = true;
		this.secondaFasciaNonDisponibile = true;
		this.terzaFasciaNonDisponibile = true;
		this.quartaFasciaNonDisponibile = true;

		this.prenotazioneService
			.tavoliInUso(this.dataSelezionata)
			.pipe(take(1))
			.subscribe({
				next: (response) => {
					console.log('Risposta tavoliInUso:', response);

					const numeroTavoliRichiesti =
						this.prenotazioneService.getNumeroTavoli();
					const data = this.dataSelezionata;

					const tavoliTotali = this.filiale?.num_tavoli || 0;

					const fasceOrarie = [
						{
							ora: '12:00',
							setter: (disponibile: boolean) =>
								(this.primaFasciaNonDisponibile = !disponibile),
						},
						{
							ora: '13:30',
							setter: (disponibile: boolean) =>
								(this.secondaFasciaNonDisponibile =
									!disponibile),
						},
						{
							ora: '19:30',
							setter: (disponibile: boolean) =>
								(this.terzaFasciaNonDisponibile = !disponibile),
						},
						{
							ora: '21:00',
							setter: (disponibile: boolean) =>
								(this.quartaFasciaNonDisponibile =
									!disponibile),
						},
					];

					for (const fascia of fasceOrarie) {
						const chiave = `${data} ${fascia.ora}`;
						const tavoliOccupati = response.data?.[chiave] ?? 0;
						const tavoliDisponibili = tavoliTotali - tavoliOccupati;

						console.log(
							`Fascia ${fascia.ora}: ${tavoliDisponibili} tavoli disponibili su ${tavoliTotali}`
						);

						if (tavoliDisponibili >= numeroTavoliRichiesti) {
							fascia.setter(true);
						}
					}
				},
				error: (err) => {
					console.error(
						'Errore HTTP nella richiesta tavoliInUso:',
						err
					);
				},
			});
	}

	/**
	 * Determina se una fascia oraria specificata è già passata rispetto all'orario attuale.
	 *
	 * La funzione verifica innanzitutto se è stata selezionata una data (`dataSelezionata`).
	 * Se la data selezionata non corrisponde alla data odierna, restituisce `false`.
	 * Se la data selezionata è oggi, confronta l'orario corrente con l'orario della fascia (`oraFascia`)
	 * fornita in formato "HH:mm". Restituisce `true` se l'orario attuale è successivo a quello della fascia.
	 *
	 * @param oraFascia - Orario della fascia in formato "HH:mm".
	 * @returns `true` se la fascia oraria è già passata, `false` altrimenti.
	 */
	isFasciaPassata(oraFascia: string): boolean {
		if (!this.dataSelezionata) return false;

		const oggi = this.formatDateToYYYYMMDD(Date.now());
		if (this.dataSelezionata !== oggi) return false;

		const now = new Date();

		const [ora, minuti] = oraFascia.split(':').map(Number);
		const fasciaDate = new Date();
		fasciaDate.setHours(ora, minuti, 0, 0);

		return now > fasciaDate;
	}

	// Ritorna una Promise con le prenotazioni del cliente
	/**
	 * Carica le prenotazioni future del cliente corrente.
	 *
	 * Questo metodo recupera tutte le prenotazioni associate al cliente tramite il servizio `prenotazioneService`.
	 * Filtra le prenotazioni restituendo solo quelle la cui data e ora di prenotazione sono uguali o successive
	 * al momento attuale. In caso di errore o se non sono presenti prenotazioni, restituisce un array vuoto.
	 *
	 * @returns {Promise<PrenotazioneWithFiliale[]>} Una Promise che si risolve con un array di prenotazioni future del cliente.
	 */
	private caricaPrenotazioniCliente(): Promise<PrenotazioneWithFiliale[]> {

		return new Promise((resolve, reject) => {
			this.prenotazioneService
				.getPrenotazioniByCliente()
				.subscribe({
					next: (res) => {
						if (res.success && res.data) {
							const now = new Date();

							const futurePrenotazioni = res.data.filter(
								(prenotazione) => {
									const parsedDate = this.parseDateTime(
										prenotazione.data_ora_prenotazione
									);
									if (!parsedDate) return false;

									return parsedDate >= now;
								}
							);
							this.prenotazioni = futurePrenotazioni;
							resolve(futurePrenotazioni);
						} else {
							this.prenotazioni = [];
							resolve([]);
						}
					},
					error: (err) => {
						console.error('Errore nel recupero prenotazioni:', err);
						this.prenotazioni = [];
						resolve([]);
					},
				});
		});
	}

	/**
	 * Conferma una prenotazione per l'orario selezionato.
	 *
	 * Questa funzione aggiorna i dettagli della prenotazione con il numero di persone,
	 * la data e ora selezionata e la filiale di riferimento. Prima di procedere con la prenotazione,
	 * verifica se esistono già prenotazioni attive per il cliente; in tal caso, mostra un messaggio di errore
	 * e blocca la nuova prenotazione. Se non ci sono prenotazioni attive, invia la richiesta di prenotazione
	 * tramite il servizio dedicato e gestisce la risposta mostrando un messaggio di successo o errore tramite toast.
	 *
	 * @param ora - L'orario selezionato per la prenotazione (formato stringa).
	 * @returns Promise<void>
	 */
	async confermaPrenotazione(ora: string) {
		this.prenotazione.numero_persone = this.persone || 0;
		this.prenotazione.data_ora_prenotazione = `${this.dataSelezionata} ${ora}`;
		this.prenotazione.ref_filiale = this.idFiliale;

		let prenotazioni: PrenotazioneWithFiliale[] = [];
		await new Promise<void>((resolve) => {
			this.caricaPrenotazioniCliente().then((result) => {
				prenotazioni = result;
				resolve();
			});
		});

		if (prenotazioni.length > 0) {
			const toast = await this.toastController.create({
				message:
					'Errore: cancella la tua vecchia prenotazione prima di farne una nuova',
				duration: 3000,
				position: 'bottom',
				color: 'danger',
			});
			await toast.present();
			return; // blocca la prenotazione
		}

		this.prenotazioneService
			.prenota(this.prenotazione)
			.pipe(take(1))
			.subscribe({
				next: async (response) => {
					console.log('Risposta prenotazione:', response);
					if (response.success) {
						const toast = await this.toastController.create({
							message: 'Prenotazione effettuata con successo',
							duration: 3000,
							position: 'bottom',
							color: 'success',
						});
						await toast.present();
						this.router.navigateByUrl('/prenota', { replaceUrl: true });
					} else {
						const toast = await this.toastController.create({
							message: 'Errore nella prenotazione',
							duration: 3000,
							position: 'bottom',
							color: 'danger',
						});
						await toast.present();
					}
				},
				error: async (err) => {
					if (err.status === 500){
						const toast = await this.toastController.create({
							message: 'Errore, non ci sono abbastanza tavoli disponibili nella fascia oraria selezionata',
							duration: 3000,
							position: 'bottom',
							color: 'danger',
						});
						await toast.present();
					} else {
						const toast = await this.toastController.create({
							message: 'Errore, per favore riprova più tardi!',
							duration: 3000,
							position: 'bottom',
							color: 'danger',
						});
						await toast.present();
					}
				}
			});
	}

	/**
	 * Converte una stringa data/ora in un oggetto `Date`.
	 *
	 * La stringa deve essere nel formato `'YYYY-MM-DD HH:mm:ss'` oppure `'YYYY-MM-DD HH:mm'`.
	 * Se la stringa non è valida o non è presente, restituisce `null`.
	 *
	 * @param dateTimeStr - La stringa rappresentante la data e l'ora.
	 * @returns Un oggetto `Date` se la conversione ha successo, altrimenti `null`.
	 */
	private parseDateTime(dateTimeStr: string): Date | null {
		if (!dateTimeStr) return null;

		const [datePart, timePart] = dateTimeStr.split(' ');
		if (!datePart || !timePart) return null;

		const [year, month, day] = datePart.split('-').map(Number);
		const [hour, minute, second] = timePart.split(':').map(Number);

		if (
			isNaN(year) ||
			isNaN(month) ||
			isNaN(day) ||
			isNaN(hour) ||
			isNaN(minute)
		) {
			console.warn('Data malformata:', dateTimeStr);
			return null;
		}

		return new Date(year, month - 1, day, hour, minute, second || 0, 0);
	}
}
