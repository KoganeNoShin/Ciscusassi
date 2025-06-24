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
    const clienteId = 1; // TODO: sostituire con id reale o da sessione

    if (!this.otp || this.otp.trim().length === 0) {
      this.presentToast("Inserisci l'OTP prima di procedere", 'warning');
      return;
    }

    try {
      const res = await firstValueFrom(
        this.prenotazioneService.getPrenotazioniByCliente(clienteId)
      );

      if (res.success && res.data && res.data.length > 0) {
        // Ordina per data_ora_prenotazione decrescente
        const latest = res.data.sort(
          (a, b) =>
            new Date(b.data_ora_prenotazione).getTime() -
            new Date(a.data_ora_prenotazione).getTime()
        )[0];

        const prenotazioneId = latest.id_prenotazione;

        const otpRes = await firstValueFrom(
          this.prenotazioneService.checkOtp(prenotazioneId, this.otp)
        );

        if (otpRes.success && otpRes.data === true) {
          this.router.navigate(['/menu-tavolo']);
        } else {
          this.presentToast('OTP non valido. Riprova.', 'danger');
        }
      } else {
        this.presentToast('Nessuna prenotazione trovata.', 'warning');
      }
    } catch (error) {
      this.presentToast('Errore durante la verifica. Riprova.', 'danger');
      console.error(error);
    }
  }
}
