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

	private intervalId: any;

	constructor(
		private toastController: ToastController,
		private authService: AuthenticationService,
		private prenotazioneService: PrenotazioneService
	) {}

	ngOnInit(): void {
		this.loadTavoli();
		this.intervalId = setInterval(() => this.loadTavoli(), 30000);
	}

	ngOnDestroy(): void {
		if (this.intervalId) {
			clearInterval(this.intervalId);
		}
	}

	async loadTavoli() {
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
		alert('Inserisci un numero valido di persone');
		return;
	}

	if (this.refClienteInput.trim() !== '') {
		const parsed = parseInt(this.refClienteInput.trim(), 10);
		if (!isNaN(parsed)) {
			refCliente = parsed;
		} else {
			alert('ref_cliente non valido');
			return;
		}
	}

	const filialeId = this.authService.getFiliale();
	const dataPrenotazione = new Date(this.getLocalIsoString());

	if (refCliente !== null) {
		try {
			const cliResp = await lastValueFrom(
				this.prenotazioneService.getPrenotazioniByCliente(refCliente)
			);

			if (cliResp.success && cliResp.data?.length) {
				const hasPrenotazioneFutura = cliResp.data.some((p) => {
					const dataEsistente = new Date(p.data_ora_prenotazione);
					return dataEsistente.getTime() >= dataPrenotazione.getTime();
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
		numero_persone: persone,
		data_ora_prenotazione: this.getLocalIsoString(),
		ref_cliente: refCliente,
		ref_filiale: filialeId,
	};

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
}


	getLocalIsoString(): string {
		const orariValidi = ['12:00', '13:30', '19:30', '21:00'];
		const now = new Date();
		const futuri = orariValidi
			.map((h) => {
				const [hh, mm] = h.split(':').map(Number);
				const d = new Date();
				d.setHours(hh, mm, 0, 0);
				return d;
			})
			.filter((d) => d.getTime() > now.getTime());

		const scelta = futuri.length
			? futuri[0]
			: (() => {
					const d = new Date();
					const [hh, mm] = orariValidi[0].split(':').map(Number);
					d.setDate(d.getDate() + 1);
					d.setHours(hh, mm, 0, 0);
					return d;
				})();

		const offsetMs = scelta.getTimezoneOffset() * 60000;
		return new Date(scelta.getTime() - offsetMs).toISOString().slice(0, -1);
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

