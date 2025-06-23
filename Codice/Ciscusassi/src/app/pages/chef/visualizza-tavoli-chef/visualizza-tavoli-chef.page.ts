import { Component, OnInit, OnDestroy } from '@angular/core'; // Aggiunto OnDestroy
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonChip,
  ToastController,
  IonLabel,
} from '@ionic/angular/standalone';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { PrenotazioneService } from 'src/app/core/services/prenotazione.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-visualizza-tavoli-chef',
  templateUrl: './visualizza-tavoli-chef.page.html',
  styleUrls: ['./visualizza-tavoli-chef.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonGrid,
    IonRow,
    IonCol,
    IonChip,
    CommonModule,
    IonLabel,
  ],
})
export class VisualizzaTavoliChefPage implements OnInit, OnDestroy {
  tavoli: Array<{
    numero: number;
    nome: string;
    orario: string;
    persone: number;
    stato: string;
  }> = [];

  tavoliFiltrati: typeof this.tavoli = [];

  legenda = [
    { stato: 'in-lavorazione', label: 'IN LAVORAZIONE' },
    { stato: 'non-in-lavorazione', label: 'NON IN LAVORAZIONE' },
  ];

  selectedFilter: string = 'tutti';

  private intervalloAggiornamento: any; // Timer per auto-refresh

  constructor(
    private toastController: ToastController,
    private authService: AuthenticationService,
    private prenotazioneService: PrenotazioneService
  ) {}

  ngOnInit(): void {
    this.loadTavoli();

    // Auto-refresh ogni 30 secondi
    this.intervalloAggiornamento = setInterval(() => {
      this.loadTavoli();
    }, 30000);
  }

  ngOnDestroy(): void {
    // Pulisci l'intervallo per evitare memory leak
    if (this.intervalloAggiornamento) {
      clearInterval(this.intervalloAggiornamento);
    }
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
              const stato = statoResponse?.data ?? 'in-lavorazione';

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
                stato: 'in-lavorazione',
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
    } catch (err: any) {
      console.error('Errore caricamento tavoli:', err);
      const messaggio = err?.error?.message || 'Errore durante il caricamento';
      this.presentToast(messaggio, 'danger');
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

  async presentToast(messaggio: string, colore: 'success' | 'danger' = 'success') {
    const toast = await this.toastController.create({
      message: messaggio,
      duration: 2000,
      position: 'bottom',
      color: colore,
    });
    toast.present();
  }

  filtraPerStato(stato: string | null) {
    if (stato) {
      this.selectedFilter = stato;
      this.applicaFiltro();
    }
  }

  applicaFiltro() {
    if (this.selectedFilter === 'tutti') {
      this.tavoliFiltrati = this.tavoli.filter(
        (t) => t.stato === 'in-lavorazione' || t.stato === 'non-in-lavorazione'
      );
    } else {
      this.tavoliFiltrati = this.tavoli.filter((t) => t.stato === this.selectedFilter);
    }
  }

  isCliccabile(tavolo: any): boolean {
    return true;
  }

  handleClick(tavolo: any) {
    console.log('Hai cliccato sul tavolo:', tavolo);
  }
}
