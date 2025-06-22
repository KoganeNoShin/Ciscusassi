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

  async conferma() {
    const persone = this.inputManuale;
    let refCliente: number | null = null;

    if (!persone || persone < 1) {
      alert('Inserisci un numero valido di persone');
      return;
    }

    const filialeId = this.authService.getFiliale();

    // Se il campo ref_cliente è pieno, prova a parsarlo
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
      ref_cliente: refCliente, // può essere null
      ref_filiale: filialeId,
    };

    try {
      const result = await lastValueFrom(this.prenotazioneService.prenotaLoco(prenotazione));
      if (result.success) {
        this.presentToast('Prenotazione creata con successo');
        this.loadTavoli();
      } else {
        this.presentToast('Errore nella creazione della prenotazione');
      }
    } catch (err) {
      console.error('Errore durante la prenotazione:', err);
      this.presentToast('Errore durante la prenotazione');
    }

    this.showPopup = false;
    this.resetPopup();
  }

 getLocalIsoString(): string {
  const orariValidi = ["12:00", "13:30", "19:30", "21:00"];
  const now = new Date();

  // Costruisci le Date oggi per gli orari disponibili
  const oggiOrari = orariValidi.map((orario) => {
    const [hh, mm] = orario.split(":").map(Number);
    const data = new Date();
    data.setHours(hh, mm, 0, 0);
    return data;
  });

  // Filtro: solo orari futuri rispetto a `now`
  const futuri = oggiOrari.filter((d) => d.getTime() > now.getTime());

  let orarioSelezionato: Date;

  if (futuri.length > 0) {
    // Prendo il primo orario futuro disponibile
    orarioSelezionato = futuri[0];
  } else {
    // Se nessun orario futuro oggi, prendo il primo di domani
    const [hh, mm] = orariValidi[0].split(":").map(Number);
    orarioSelezionato = new Date();
    orarioSelezionato.setDate(orarioSelezionato.getDate() + 1);
    orarioSelezionato.setHours(hh, mm, 0, 0);
  }

  // Rimuovo il fuso orario (timezone offset)
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
