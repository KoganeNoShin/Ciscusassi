// Importazioni da Angular e Ionic
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TavoloService } from 'src/app/core/services/tavolo.service'; // Servizio per gestire dati del tavolo
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
	ToastController, // Componente per notifiche utente
} from '@ionic/angular/standalone';
import { RouterModule, Router } from '@angular/router';
import { PrenotazioneService } from 'src/app/core/services/prenotazione.service'; // Servizio per gestione prenotazioni
import { firstValueFrom } from 'rxjs'; // Utilizzato per convertire observable in promise

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
	// Variabili di stato per OTP e numero della torretta
	otp: string = '';
	numeroTorretta: number | null = null;

	constructor(
		private prenotazioneService: PrenotazioneService,
		private toastController: ToastController, // Per mostrare messaggi all'utente
		private router: Router,
		private tavoloService: TavoloService
	) {}

	ngOnInit() {
		this.ngViewWillEnter(); // Reset dei dati ogni volta che si entra nella pagina
	}

	ngViewWillEnter(){
		this.tavoloService.svuotaTavolo(); // Svuota eventuali dati del tavolo precedenti
		this.numeroTorretta = null;
		this.otp = "";
	}

	// Metodo per mostrare messaggi di feedback all'utente
	async presentToast(message: string, color: string = 'primary') {
		const toast = await this.toastController.create({
			message,
			duration: 2500,
			color,
			position: 'bottom',
		});
		toast.present();
	}

	// Metodo chiamato al click del bottone "Procedi"
	async onProceedClick() {
		const refTorretta = this.numeroTorretta;

		// Validazione iniziale dei campi
		if (!this.otp || this.otp.trim().length === 0 || this.numeroTorretta === null || this.numeroTorretta === -1) {
			this.presentToast("Compila tutti i campi prima di procedere", 'warning');
			return;
		}

		// Controllo formato OTP: 6 caratteri alfanumerici
		const otpPattern = /^[a-zA-Z0-9]{6}$/;
		if (!otpPattern.test(this.otp.trim())) {
			this.presentToast(
				'Formato OTP non valido. Inserisci un codice alfanumerico di 6 caratteri.',
				'warning'
			);
			return;
		}

		// Definizione fasce orarie valide per ordinare
		const fasceOrarie = [
			{ inizio: '11:20', fine: '13:30' },
			{ inizio: '13:30', fine: '19:00' }, // TODO: fascia da rivedere
			{ inizio: '19:30', fine: '21:00' },
			{ inizio: '21:00', fine: '22:30' },
		];

		const now = new Date(); // Data e ora attuale
		let dataOraPrenotazione: string | null = null;

		// Controllo se l'orario attuale rientra in una fascia oraria accettabile
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
				(now >= inizioFascia && now <= fineFascia) || // Se siamo dentro la fascia
				(now < inizioFascia && diffMinutiInizio <= 10) // Oppure meno di 10 minuti prima dell’inizio
			) {
				// Costruisce la stringa con la data e ora della prenotazione
				const yyyy = now.getFullYear();
				const mm = (now.getMonth() + 1).toString().padStart(2, '0');
				const dd = now.getDate().toString().padStart(2, '0');
				dataOraPrenotazione = `${yyyy}-${mm}-${dd} ${fascia.inizio}`;
				break;
			}
		}

		// Nessuna fascia oraria valida trovata
		if (!dataOraPrenotazione) {
			this.presentToast(
				'Nessuna fascia oraria valida trovata per l’orario attuale.',
				'warning'
			);
			return;
		}

		try {
			// Verifica dell'OTP tramite servizio
			const otpRes = await firstValueFrom(
				this.prenotazioneService.checkOtp(
					dataOraPrenotazione,
					refTorretta as number,
					this.otp.trim()
				)
			);

			if (otpRes.success && otpRes.data != false) {
				// OTP valido: si salva la prenotazione e si procede
				this.presentToast('OTP valido. Accesso consentito.', 'success');
				this.tavoloService.setPrenotazione(otpRes.data);
				this.tavoloService.setNumeroTavolo(refTorretta!);
				this.router.navigate(['/menu-tavolo']); // Naviga al menu del tavolo
			} else {
				// OTP non valido
				const msg = otpRes.message || 'OTP non valido. Riprova.';
				this.presentToast(msg, 'danger');
			}
		} catch (error) {
			// Gestione errori di rete o del servizio
			this.presentToast(
				'Errore durante la verifica dell’OTP. Riprova più tardi.',
				'danger'
			);
			console.error(error);
		}

		// Debug: stampa data e ora della prenotazione selezionata
		console.log(dataOraPrenotazione);
	}
}
