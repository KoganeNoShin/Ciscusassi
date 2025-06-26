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
	IonCheckbox,
} from '@ionic/angular/standalone';

@Component({
	selector: 'app-scelta-giorno',
	templateUrl: './scelta-giorno.page.html',
	styleUrls: ['./scelta-giorno.page.scss'],
	standalone: true,
	imports: [
		IonCheckbox,
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
		ref_cliente: null,
		ref_filiale: 0,
	};
	prenotazioni: PrenotazioneWithFiliale[] = [];

	constructor(
		private prenotazioneService: PrenotazioneService,
		private filialeService: FilialeService,
		private toastController: ToastController,
		private router: Router
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
			.tavoliInUso(this.idFiliale, this.dataSelezionata)
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

	// Funzione per verificare se la fascia oraria è passata (solo per oggi)
	isFasciaPassata(oraFascia: string): boolean {
		if (!this.dataSelezionata) return false;

		const oggi = this.formatDateToYYYYMMDD(Date.now());
		if (this.dataSelezionata !== oggi) return false; // controllo solo se è oggi

		const now = new Date();

		const [ora, minuti] = oraFascia.split(':').map(Number);
		const fasciaDate = new Date();
		fasciaDate.setHours(ora, minuti, 0, 0);

		return now > fasciaDate;
	}

	// Ritorna una Promise con le prenotazioni del cliente
	private caricaPrenotazioniCliente(): Promise<PrenotazioneWithFiliale[]> {
		const idCliente = 1;

		return new Promise((resolve, reject) => {
			this.prenotazioneService
				.getPrenotazioniByCliente(idCliente)
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

	async confermaPrenotazione(ora: string) {
		this.prenotazione.numero_persone = this.persone || 0;
		this.prenotazione.data_ora_prenotazione = `${this.dataSelezionata} ${ora}`;
		this.prenotazione.ref_filiale = this.idFiliale;
		this.prenotazione.ref_cliente = 1;

		const prenotazioni = await this.caricaPrenotazioniCliente();

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
						this.router.navigateByUrl('/prenota');
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
					console.error(
						'Errore nella richiesta di prenotazione:',
						err
					);
					const toast = await this.toastController.create({
						message: 'Errore nella prenotazione',
						duration: 3000,
						position: 'bottom',
						color: 'danger',
					});
					await toast.present();
				},
			});
	}

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
