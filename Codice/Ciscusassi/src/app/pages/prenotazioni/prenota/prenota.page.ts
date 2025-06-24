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
	ToastController
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
		LeafletMapComponent
	]
})
export class PrenotaPage implements OnInit {
	filiali: FilialeRecord[] = [];
	filialiFiltrate: FilialeRecord[] = [];
	loading: boolean = true;
	error: boolean = false;
	searchFiliale: string = '';
	prenotazioni: PrenotazioneWithFiliale[] = [];
	FilialePrenotazione: FilialeRecord | null = null;

	ionViewWillEnter() {
	this.caricaPrenotazioniCliente();
  	}

	constructor(
		private filialeService: FilialeService,
		private router: Router,
		private prenotazioneService: PrenotazioneService,
		private alertController: AlertController,
		private toastController: ToastController
	) {}

	ngOnInit(): void {
		this.caricaFiliali();
		this.prenotazioneService.svuotaPrenotazione();
	}

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
			}
		});
	}

	private caricaPrenotazioniCliente(): void {
		const idCliente = 1;
		this.prenotazioneService.getPrenotazioniByCliente(idCliente).subscribe({
			next: (res) => {
				if (res.success && res.data) {
					this.prenotazioni = res.data;
				} else {
					this.prenotazioni = [];
				}
			},
			error: (err) => {
				console.error('Errore nel recupero prenotazioni:', err);
				this.prenotazioni = [];
			}
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
					cssClass: 'alert-button-cancel'
				},
				{
					text: 'Conferma',
					handler: () => {
						this.cancellaPrenotazione(id);
					},
					cssClass: 'alert-button-confirm'
				}
			],
			cssClass: 'custom-alert'
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
						position: 'bottom'
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
					position: 'bottom'
				});
				await toast.present();
			}
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
