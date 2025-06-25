import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
	IonButton,
	IonCard,
	IonCol,
	IonContent,
	IonGrid,
	IonImg,
	IonRow,
	IonText,
	IonInput,
	ToastController,
} from '@ionic/angular/standalone';
import { RouterModule, Router } from '@angular/router';
import { PrenotazioneService } from 'src/app/core/services/prenotazione.service';
import { firstValueFrom } from 'rxjs';

@Component({
	selector: 'app-ordina-al-tavolo',
	templateUrl: './ordina-al-tavolo.page.html',
	styleUrls: ['./ordina-al-tavolo.page.scss'],
	standalone: true,
	imports: [
		IonInput,
		IonContent,
		CommonModule,
		FormsModule,
		IonGrid,
		IonRow,
		IonCol,
		IonImg,
		IonCard,
		IonText,
		IonButton,
		RouterModule,
	],
})
export class OrdinaAlTavoloPage implements OnInit {
	otp: string = '';

	constructor(
		private prenotazioneService: PrenotazioneService,
		private toastController: ToastController,
		private router: Router
	) {}

	ngOnInit() {}

	async presentToast(message: string, color: string = 'primary') {
		const toast = await this.toastController.create({
			message,
			duration: 2500,
			color,
			position: 'bottom',
		});
		toast.present();
	}

	async onProceedClick() {
		const refTorretta = 12; // Torretta fissa per ora

		if (!this.otp || this.otp.trim().length === 0) {
			this.presentToast("Inserisci l'OTP prima di procedere", 'warning');
			return;
		}

		const otpPattern = /^[a-zA-Z0-9]{6}$/; // OTP alfanumerico di 6 caratteri
		if (!otpPattern.test(this.otp.trim())) {
			this.presentToast(
				'Formato OTP non valido. Inserisci un codice alfanumerico di 6 caratteri.',
				'warning'
			);
			return;
		}

		const fasceOrarie = [
			{ inizio: '12:00', fine: '13:30' },
			{ inizio: '13:30', fine: '15:00' },
			{ inizio: '19:30', fine: '21:00' },
			{ inizio: '21:00', fine: '22:30' },
		];

		const now = new Date();
		let dataOraPrenotazione: string | null = null;

		for (const fascia of fasceOrarie) {
			const [inizioHour, inizioMin] = fascia.inizio
				.split(':')
				.map(Number);
			const [fineHour, fineMin] = fascia.fine.split(':').map(Number);

			const inizioFascia = new Date(now);
			inizioFascia.setHours(inizioHour, inizioMin, 0, 0);

			const fineFascia = new Date(now);
			fineFascia.setHours(fineHour, fineMin, 0, 0);

			const diffMinutiInizio =
				(inizioFascia.getTime() - now.getTime()) / 60000;
			const minutiDopoFine =
				(now.getTime() - fineFascia.getTime()) / 60000;

			if (
				(now >= inizioFascia && now <= fineFascia) || // dentro la fascia
				(now < inizioFascia && diffMinutiInizio <= 10) // meno di 10 min prima
			) {
				const yyyy = now.getFullYear();
				const mm = (now.getMonth() + 1).toString().padStart(2, '0');
				const dd = now.getDate().toString().padStart(2, '0');
				dataOraPrenotazione = `${yyyy}-${mm}-${dd} ${fascia.inizio}:00`;
				break;
			}
		}

		if (!dataOraPrenotazione) {
			this.presentToast(
				'Nessuna fascia oraria valida trovata per l’orario attuale.',
				'warning'
			);
			return;
		}

		try {
			const otpRes = await firstValueFrom(
				this.prenotazioneService.checkOtp(
					dataOraPrenotazione,
					refTorretta,
					this.otp.trim()
				)
			);

			if (otpRes.success && otpRes.data === true) {
				this.presentToast('OTP valido. Accesso consentito.', 'success');
				this.router.navigate(['/menu-tavolo']);
			} else {
				const msg = otpRes.message || 'OTP non valido. Riprova.';
				this.presentToast(msg, 'danger');
			}
		} catch (error) {
			this.presentToast(
				'Errore durante la verifica dell’OTP. Riprova più tardi.',
				'danger'
			);
			console.error(error);
		}

    console.log(dataOraPrenotazione);
    
	}
  
}
