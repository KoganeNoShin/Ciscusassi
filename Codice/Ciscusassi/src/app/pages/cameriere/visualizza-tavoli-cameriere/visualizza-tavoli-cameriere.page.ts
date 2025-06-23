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
  IonItem,
  IonLabel,
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
    IonItem,
    IonLabel,
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

  // Modale conferma arrivo
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

    this.intervalId = setInterval(() => {
      this.loadTavoli();
    }, 30000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
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
                this.prenotazioneService.getStatoPrenotazione(p.id_prenotazione)
              );
              const stato = statoResponse?.data ?? 'attesa';

              return {
                numero: p.id_prenotazione,
                nome: `Torretta: ${p.ref_torretta}`,
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

    const filialeId = this.authService.getFiliale();

    if (this.refClienteInput.trim() !== '') {
      const parsed = parseInt(this.refClienteInput.trim(), 10);
      if (!isNaN(parsed)) {
        refCliente = parsed;
      } else {
        alert('ref_cliente non valido');
        return;
      }
    }

    const prenotazione: PrenotazioneRequest = {
      numero_persone: persone,
      data_ora_prenotazione: this.getLocalIsoString(),
      ref_cliente: refCliente,
      ref_filiale: filialeId,
    };

    try {
      const result = await lastValueFrom(
        this.prenotazioneService.prenotaLoco(prenotazione)
      );
      if (result.success) {
        this.presentToast('Prenotazione creata con successo');
        await this.loadTavoli();
      } else {
        this.presentToast('Errore nella creazione della prenotazione');
      }
    } catch (err) {
      console.error('Errore durante la prenotazione:', err);
      this.presentToast('Errore, non ci sono abbastanza tavoli disponibili');
    }

    this.showPopup = false;
    this.resetPopup();
  }

  getLocalIsoString(): string {
    const orariValidi = ['12:00', '13:30', '19:30', '21:00'];
    const now = new Date();

    const oggiOrari = orariValidi.map((orario) => {
      const [hh, mm] = orario.split(':').map(Number);
      const data = new Date();
      data.setHours(hh, mm, 0, 0);
      return data;
    });

    const futuri = oggiOrari.filter((d) => d.getTime() > now.getTime());

    let orarioSelezionato: Date;

    if (futuri.length > 0) {
      orarioSelezionato = futuri[0];
    } else {
      const [hh, mm] = orariValidi[0].split(':').map(Number);
      orarioSelezionato = new Date();
      orarioSelezionato.setDate(orarioSelezionato.getDate() + 1);
      orarioSelezionato.setHours(hh, mm, 0, 0);
    }

    const offsetMs = orarioSelezionato.getTimezoneOffset() * 60000;
    const localISOTime = new Date(orarioSelezionato.getTime() - offsetMs)
      .toISOString()
      .slice(0, -1);

    return localISOTime;
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
    // Tavoli cliccabili sono tutti tranne 'senza-ordini' e 'attesa-arrivo'
    return tavolo.stato !== 'senza-ordini';
  }

  handleClick(tavolo: any) {
    if (tavolo.stato === 'attesa-arrivo') {
      this.tavoloDaConfermare = tavolo;
      this.showConfermaArrivoPopup = true;
    } else if (this.isCliccabile(tavolo)) {
      console.log('Hai cliccato sul tavolo:', tavolo);
      // Altre azioni possibili
    }
  }

  async confermaArrivo() {
    if (!this.tavoloDaConfermare) return;

    try {
      // Usa il servizio per confermare la prenotazione passando l'id (numero)
      const response = await lastValueFrom(
        this.prenotazioneService.confermaPrenotazione(this.tavoloDaConfermare.numero)
      );

      if (response.success) {
        this.presentToast(
          `Arrivo cliente confermato per tavolo ${this.tavoloDaConfermare.numero}`
        );
      } else {
        this.presentToast(
          `Errore nella conferma arrivo per tavolo ${this.tavoloDaConfermare.numero}`
        );
      }
    } catch (error) {
      console.error('Errore conferma arrivo:', error);
      this.presentToast('Errore durante la conferma arrivo');
    }

    this.showConfermaArrivoPopup = false;
    this.tavoloDaConfermare = null;

    await this.loadTavoli();
  }

  chiudiPopupArrivo() {
    this.showConfermaArrivoPopup = false;
    this.tavoloDaConfermare = null;
  }

  async presentToast(messaggio: string) {
    const toast = await this.toastController.create({
      message: messaggio,
      duration: 2000,
      position: 'bottom',
      color: 'success',
    });
    await toast.present();
  }

  filtraPerStato(stato: string | null) {
    this.selectedFilter = stato;
    this.applicaFiltro();
  }

  applicaFiltro() {
    if (!this.selectedFilter) {
      this.tavoliFiltrati = [...this.tavoli];
    } else {
      this.tavoliFiltrati = this.tavoli.filter(
        (t) => t.stato === this.selectedFilter
      );
    }
  }
}
