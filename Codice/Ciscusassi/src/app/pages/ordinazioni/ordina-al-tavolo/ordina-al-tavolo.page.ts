import { Component, OnInit } from '@angular/core';
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
	IonButton,
	IonCard,
	IonCol,
	IonContent,
	IonGrid,
	IonImg,
	IonRow,
	IonText,
	IonInput,
	IonInputOtp,
	ToastController,
	IonItem,
	IonSpinner,
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
		IonSpinner,
		IonItem,
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
		IonInputOtp,
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
	],
})
export class OrdinaAlTavoloPage implements OnInit {
	// Campi legati al form
	otp: string = '';
	numeroTorretta: number | null = null;
	formOTP: FormGroup = new FormGroup({});

	isLoading: boolean = false;

	constructor(
		private fb: FormBuilder,
		private prenotazioneService: PrenotazioneService, // Servizio per la verifica OTP
		private toastController: ToastController, // Mostra notifiche all'utente
		private router: Router, // Gestione navigazione
		private tavoloService: TavoloService // Gestione dati tavolo corrente
	) {}

	ngOnInit() {
		this.formOTP = this.fb.group({
			idTorretta: ['', [Validators.required, Validators.min(0)]],
			otp: [
				'',
				[
					Validators.required,
					Validators.minLength(6),
					Validators.maxLength(6),
					Validators.pattern(/^[a-zA-Z0-9]*$/), // Nessun simbolo, solo lettere/numeri
				],
			],
		});
		this.ngViewWillEnter(); // Reset al caricamento
	}

	pipo() {
		console.log(this.otp);
	}

	// Metodo chiamato ogni volta che si entra nella pagina (reset stato)
	ngViewWillEnter() {
		this.tavoloService.svuotaTavolo(); // Reset dati tavolo
		this.numeroTorretta = null;
		this.otp = '';
		this.formOTP.reset();
	}

	// Mostra un messaggio all'utente con Ionic Toast
	async presentToast(message: string, color: string = 'primary') {
		const toast = await this.toastController.create({
			message,
			duration: 2500,
			color,
			position: 'bottom',
		});
		toast.present();
	}

	// Metodo eseguito quando si clicca sul pulsante "PROCEDI"
	async onSubmit() {
		const refTorretta = this.numeroTorretta;
		this.isLoading = true;

		// ✅ Validazione base dei campi obbligatori
		if (
			!this.otp ||
			this.otp.trim().length === 0 ||
			this.numeroTorretta === null ||
			this.numeroTorretta === -1
		) {
			this.presentToast(
				'Compila tutti i campi prima di procedere',
				'warning'
			);
			this.isLoading = false;

			return;
		}

		// ✅ Validazione OTP: deve essere esattamente 6 caratteri alfanumerici
		const otpPattern = /^[a-zA-Z0-9]{6}$/;
		if (!otpPattern.test(this.otp.trim())) {
			this.presentToast(
				'Formato OTP non valido. Inserisci un codice alfanumerico di 6 caratteri.',
				'warning'
			);
			this.isLoading = false;
			return;
		}

		// ✅ Definizione fasce orarie valide
		const fasceOrarie = [
			{ inizio: '00:00', fine: '23:59' },
			{ inizio: '13:30', fine: '19:00' }, // TODO: rivedere fascia centrale
			{ inizio: '19:30', fine: '21:00' },
			{ inizio: '21:00', fine: '22:30' },
		];

		const now = new Date();
		let dataOraPrenotazione: string | null = null;

		// ✅ Determinazione fascia oraria corrente o imminente (entro 10 minuti)
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

			if (
				(now >= inizioFascia && now <= fineFascia) || // Dentro la fascia
				(now < inizioFascia && diffMinutiInizio <= 10) // Entro 10 min dall'inizio
			) {
				const yyyy = now.getFullYear();
				const mm = (now.getMonth() + 1).toString().padStart(2, '0');
				const dd = now.getDate().toString().padStart(2, '0');
				dataOraPrenotazione = `${yyyy}-${mm}-${dd} ${fascia.inizio}`;
				break;
			}
		}

		// ❌ Nessuna fascia valida trovata
		if (!dataOraPrenotazione) {
			this.presentToast(
				'Nessuna fascia oraria valida trovata per l’orario attuale.',
				'warning'
			);
			this.isLoading = false;

			return;
		}

		try {
			// ✅ Verifica OTP tramite il servizio backend
			const otpRes = await firstValueFrom(
				this.prenotazioneService.checkOtp(
					dataOraPrenotazione,
					refTorretta as number,
					this.otp.trim()
				)
			);

			if (otpRes.success && otpRes.data != false) {
				// ✅ Salva la prenotazione e reindirizza al menu tavolo
				this.presentToast('OTP valido. Accesso consentito.', 'success');
				this.tavoloService.setPrenotazione(otpRes.data);
				this.tavoloService.setNumeroTavolo(refTorretta!);
				this.router.navigate(['/menu-tavolo']);
			} else {
				// ❌ OTP errato o scaduto
				const msg = otpRes.message || 'OTP non valido. Riprova.';
				this.presentToast(msg, 'danger');
				this.isLoading = false;
			}
		} catch (error) {
			// ❌ Errore durante la chiamata al backend
			this.presentToast(
				'Errore durante la verifica dell’OTP. Riprova più tardi.',
				'danger'
			);
			console.error(error);
			this.isLoading = false;
		}

		// Debug: log dell'orario di prenotazione usato
		console.log(dataOraPrenotazione);
		this.isLoading = false;
	}
}
