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
	IonButton,
	IonModal,
	ToastController,
	IonChip,
  IonItem,
  IonLabel,
} from '@ionic/angular/standalone';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { PrenotazioneService } from 'src/app/core/services/prenotazione.service';
import { lastValueFrom } from 'rxjs';

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
    IonItem,
    IonLabel,
	],
})
export class VisualizzaTavoliCamerierePage implements OnInit {
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
	];

	selectedFilter: string | null = null;

	showPopup = false;
	personePossibili = [1, 2, 3, 4, 5, 6, 7];
	personeSelezionate: number | null = null;
	inputManuale: number | null = null;
	refClienteInput: string = '';

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
				this.prenotazioneService.getPrenotazioniDelGiornoFiliale(filiale)
			);

			if (response.success && response.data?.length) {
				const prenotazioniFiltrate = response.data;

				const tavoliCompletati = await Promise.all(
					prenotazioniFiltrate.map(async (p) => {
						try {
							const statoResponse = await lastValueFrom(
								this.prenotazioneService.getStatoPrenotazione(p.ref_torretta)
							);
							const stato = statoResponse?.data ?? 'attesa';

							return {
								numero: p.ref_torretta,
								nome: `Tavolo ${p.id_prenotazione}`,
								orario: this.formattaOrario(p.data_ora_prenotazione),
								persone: p.numero_persone,
								stato: stato,
							};
						} catch (err) {
							console.error(`Errore stato per torretta ${p.ref_torretta}`, err);
							return {
								numero: p.ref_torretta,
								nome: `Tavolo ${p.id_prenotazione}`,
								orario: this.formattaOrario(p.data_ora_prenotazione),
								persone: p.numero_persone,
								stato: 'attesa',
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
		} catch (err) {
			console.error('Errore caricamento tavoli:', err);
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

	add() {
		this.showPopup = true;
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
			this.personeSelezionate = null;
		} else {
			this.personeSelezionate = null;
		}
	}

conferma() {
  const persone = this.inputManuale;
  let refCliente: string | null = this.refClienteInput.trim();

  if (!persone || persone < 1) {
    alert('Inserisci un numero valido di persone');
    return;
  }

  if (refCliente === '') {
    refCliente = null;
  }

  this.presentToast(
    `Aggiunto tavolo con ${persone} persone e ref_cliente: ${refCliente ?? 'nessuno'}`
  );
  this.showPopup = false;
  this.resetPopup();
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
		if (this.isCliccabile(tavolo)) {
			console.log('Hai cliccato sul tavolo:', tavolo);
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

	filtraPerStato(stato: string | null) {
		this.selectedFilter = stato;
		this.applicaFiltro();
	}

	applicaFiltro() {
		if (!this.selectedFilter) {
			this.tavoliFiltrati = [...this.tavoli];
		} else {
			this.tavoliFiltrati = this.tavoli.filter((t) => t.stato === this.selectedFilter);
		}
	}
}
