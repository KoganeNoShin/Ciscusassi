import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
	IonContent,
	IonCard,
	IonButton,
	IonLabel,
	IonCol,
	IonRow,
	IonGrid,
	IonItem,
	IonInput,
	IonIcon,
	AlertController,
	ToastController,
	IonSpinner,
} from '@ionic/angular/standalone';
import { HeroComponent } from 'src/app/components/hero/hero.component';
import { LeafletMapComponent } from 'src/app/components/leaflet-map/leaflet-map.component';

import { FilialeRecord } from 'src/app/core/interfaces/Filiale';
import { FilialeService } from 'src/app/core/services/filiale.service';
import { ApiResponse } from 'src/app/core/interfaces/ApiResponse';
import { Router, RouterModule } from '@angular/router';
import { PrenotazioneService } from 'src/app/core/services/prenotazione.service';
import { PrenotazioneWithFiliale } from 'src/app/core/interfaces/Prenotazione';

@Component({
	selector: 'app-prenota',
	templateUrl: './prenota.page.html',
	styleUrls: ['./prenota.page.scss'],
	standalone: true,
	imports: [
		IonSpinner,
		RouterModule,
		IonCard,
		IonButton,
		IonLabel,
		IonCol,
		IonRow,
		IonGrid,
		IonItem,
		IonInput,
		IonContent,
		IonIcon,
		CommonModule,
		FormsModule,
		HeroComponent,
		LeafletMapComponent,
	],
})
export class PrenotaPage implements OnInit {
	filiali: FilialeRecord[] = [];
	filialiFiltrate: FilialeRecord[] = [];
	loadingPrenotazioni: boolean = true;
	error: boolean = false;
	searchFiliale: string = '';
	prenotazioni: PrenotazioneWithFiliale[] = [];
	FilialePrenotazione: FilialeRecord | null = null;
	loading: boolean = true;

	ionViewWillEnter() {
		this.caricaFiliali();
		this.caricaPrenotazioniCliente();
		this.prenotazioneService.svuotaPrenotazione();
	}

	constructor(
		private filialeService: FilialeService,
		private router: Router,
		private prenotazioneService: PrenotazioneService,
		private alertController: AlertController,
		private toastController: ToastController
	) {}

	ngOnInit(): void {}

	private caricaFiliali(): void {
		this.filialeService.GetSedi().subscribe({
			next: (res: ApiResponse<FilialeRecord[]>) => {
				if (res.success && res.data) {
					this.filiali = res.data;
					this.filialiFiltrate = res.data;
				} else {
					this.error = true;
				}
				this.loading = false;
			},
			error: () => {
				this.error = true;
				this.loading = false;
			},
		});
	}

	// Funzione helper per il parsing corretto del formato "YYYY-MM-DD HH:MM:SS"
	private parseDateTime(dateTimeStr: string): Date | null {
		if (!dateTimeStr) return null;

		const [datePart, timePart] = dateTimeStr.split(" ");
		if (!datePart || !timePart) return null;

		const [year, month, day] = datePart.split("-").map(Number);
		const [hour, minute, second] = timePart.split(":").map(Number);

		if (
			isNaN(year) || isNaN(month) || isNaN(day) ||
			isNaN(hour) || isNaN(minute)
		) {
			console.warn("Data malformata:", dateTimeStr);
			return null;
		}

		return new Date(year, month - 1, day, hour, minute, second || 0, 0);
	}

	private caricaPrenotazioniCliente(): void {
		this.loadingPrenotazioni = true;
		const idCliente = 1;

		this.prenotazioneService.getPrenotazioniByCliente(idCliente).subscribe({
			next: (res) => {
				if (res.success && res.data) {
					const now = new Date();

					this.prenotazioni = res.data.filter((prenotazione) => {
						const parsedDate = this.parseDateTime(prenotazione.data_ora_prenotazione);
						if (!parsedDate) return false;

						return parsedDate >= now;
					});
				} else {
					this.prenotazioni = [];
				}
				this.loadingPrenotazioni = false;
			},
			error: (err) => {
				console.error('Errore nel recupero prenotazioni:', err);
				this.prenotazioni = [];
				this.loadingPrenotazioni = false;
			},
		});
	}

	filtroFiliali(): void {
		const term = this.searchFiliale.toLowerCase();
		this.filialiFiltrate = this.filiali.filter((filiale) =>
			filiale.indirizzo.toLowerCase().includes(term)
		);
	}

	salvaFiliale(id_filiale: number): void {
		this.prenotazioneService.setFilialeId(id_filiale);
		this.router.navigate(['/numero-persone']);
	}

	async confermaCancellazione(id: number): Promise<void> {
		const alert = await this.alertController.create({
			header: 'Conferma cancellazione',
			message: 'Sei sicuro di voler cancellare questa prenotazione?',
			buttons: [
				{
					text: 'Annulla',
					role: 'cancel',
					cssClass: 'alert-button-cancel',
				},
				{
					text: 'Conferma',
					handler: async () => {
						if (
							this.prenotazioni.find(
								(p) => p.id_prenotazione === id
							)?.otp == null
						) {
							this.cancellaPrenotazione(id);
						} else {
							const toast = await this.toastController.create({
								message: 'Impossibile cancellare la prenotazione perché è ancora associata a un tavolo',
								duration: 2000,
								color: 'danger',
								position: 'bottom',
							});
							await toast.present();
						}
					},
					cssClass: 'alert-button-confirm',
				},
			],
			cssClass: 'custom-alert',
		});

		await alert.present();
	}

	private async cancellaPrenotazione(id: number): Promise<void> {
		this.prenotazioneService.eliminaPrenotazione(id).subscribe({
			next: async (res) => {
				if (res.success) {
					this.prenotazioni = this.prenotazioni.filter(
						(p) => p.id_prenotazione !== id
					);
					const toast = await this.toastController.create({
						message: 'Prenotazione cancellata con successo.',
						duration: 2000,
						color: 'success',
						position: 'bottom',
					});
					await toast.present();
				}
			},
			error: async (err) => {
				console.error('Errore nella cancellazione:', err);
				const toast = await this.toastController.create({
					message: 'Errore nella cancellazione della prenotazione.',
					duration: 2000,
					color: 'danger',
					position: 'bottom',
				});
				await toast.present();
			},
		});
	}

	formattaData(dateInput: string | number): string {
		const date = new Date(dateInput);
		if (isNaN(date.getTime())) {
			console.error('Data non valida:', dateInput);
			return '';
		}

		const pad = (n: number) => n.toString().padStart(2, '0');
		return `${pad(date.getDate())}/${pad(
			date.getMonth() + 1
		)}/${pad(date.getFullYear())} - ${pad(date.getHours())}:${pad(
			date.getMinutes()
		)}`;
	}
}
