import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilialeRecord } from 'src/app/core/interfaces/Filiale';
import { PrenotazioneService } from 'src/app/core/services/prenotazione.service';
import { FilialeService } from 'src/app/core/services/filiale.service';
import { ApiResponse } from 'src/app/core/interfaces/ApiResponse';
import { take } from 'rxjs/operators';
import { PrenotazioneRequest } from 'src/app/core/interfaces/Prenotazione';
import {
  IonContent,
  IonSpinner,
  IonDatetime,
  IonLabel,
  IonRow,
  IonCol,
  IonButton,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-scelta-giorno',
  templateUrl: './scelta-giorno.page.html',
  styleUrls: ['./scelta-giorno.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonCol,
    IonRow,
    IonDatetime,
    IonSpinner,
    IonContent,
    CommonModule,
    FormsModule,
  ],
})
export class SceltaGiornoPage implements OnInit {
  filiale: FilialeRecord | null = null;
  dataSelezionata: string = '';
  idFiliale: number = 0;
  loading: boolean = false;
  hasError: boolean = false;
  primaFasciaNonDisponibile: boolean = true;
  secondaFasciaNonDisponibile: boolean = true;
  terzaFasciaNonDisponibile: boolean = true;
  quartaFasciaNonDisponibile: boolean = true;
  persone: number | null = null;
  prenotazione: PrenotazioneRequest = {
    numero_persone: 0,
    data_ora_prenotazione: '',
    ref_cliente: null,
    ref_filiale: 0,
  };

  constructor(
    private prenotazioneService: PrenotazioneService,
    private filialeService: FilialeService
  ) {}

  ngOnInit() {
    this.idFiliale = this.prenotazioneService.getFilialeId();
    console.log('ID filiale caricato:', this.idFiliale);

    this.dataSelezionata = this.formatDateToYYYYMMDD(Date.now());

    if (!this.idFiliale) {
      console.error('ID filiale non valido!');
    }

    this.loadFiliale();

    this.persone = this.prenotazioneService.getNumeroPosti();
    console.log('Numero persone caricato:', this.persone);
  }

  private loadFiliale() {
    this.loading = true;
    this.hasError = false;

    this.filialeService
      .GetSedi()
      .pipe(take(1))
      .subscribe({
        next: (response) => this.handleResponse(response),
        error: (err) => {
          console.error('Errore chiamata GetSedi:', err);
          this.loading = false;
          this.hasError = true;
        },
      });
  }

  private handleResponse(response: ApiResponse<FilialeRecord[]>): void {
    this.loading = false;

    if (response.success && Array.isArray(response.data)) {
      const filiale = response.data.find(
        (f) => f.id_filiale === this.idFiliale
      );

      if (filiale) {
        this.filiale = filiale;
        this.hasError = false;

        // Ora che la filiale è caricata, fai i controlli sulla data di oggi
        this.alCambioData();
      } else {
        console.error('Filiale non trovata con id:', this.idFiliale);
        this.hasError = true;
      }
    } else {
      console.error(
        'Errore nella risposta GetSedi:',
        response.message || 'Errore sconosciuto'
      );
      this.hasError = true;
    }
  }

  noMartediEMaxDueSettimane = (dateString: string): boolean => {
    const d = new Date(dateString);
    const oggi = new Date();
    const giorno = d.getDay(); // giorno della settimana locale

    oggi.setHours(0, 0, 0, 0);
    const dueSettimane = new Date(oggi);
    dueSettimane.setDate(oggi.getDate() + 14);
    d.setHours(0, 0, 0, 0);

    return (
      giorno !== 2 &&
      d.getTime() >= oggi.getTime() &&
      d.getTime() <= dueSettimane.getTime()
    );
  };

  formatDateToYYYYMMDD(dateInput: string | number): string {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      console.error('Data non valida:', dateInput);
      return '';
    }

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}`;
  }

  alCambioData() {
    console.log('Data selezionata (raw):', this.dataSelezionata);

    if (!this.dataSelezionata) {
      console.warn('Data non selezionata!');
      return;
    }

    const dataFormattata = this.formatDateToYYYYMMDD(this.dataSelezionata);
    this.dataSelezionata = dataFormattata;

    if (!this.idFiliale || !this.dataSelezionata) {
      console.error('Parametri mancanti per tavoliInUso');
      return;
    }

    this.primaFasciaNonDisponibile = true;
    this.secondaFasciaNonDisponibile = true;
    this.terzaFasciaNonDisponibile = true;
    this.quartaFasciaNonDisponibile = true;

    this.prenotazioneService
      .tavoliInUso(this.idFiliale, this.dataSelezionata)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          console.log('Risposta tavoliInUso:', response);

          const numeroTavoliRichiesti = this.prenotazioneService.getNumeroTavoli();
          const data = this.dataSelezionata;

          // Supponiamo che il totale tavoli sia salvato nella proprietà 'num_tavoli' di filiale
          const tavoliTotali = this.filiale?.num_tavoli || 0;

          const fasceOrarie = [
            {
              ora: '12:00',
              setter: (disponibile: boolean) =>
                (this.primaFasciaNonDisponibile = !disponibile),
            },
            {
              ora: '13:30',
              setter: (disponibile: boolean) =>
                (this.secondaFasciaNonDisponibile = !disponibile),
            },
            {
              ora: '19:30',
              setter: (disponibile: boolean) =>
                (this.terzaFasciaNonDisponibile = !disponibile),
            },
            {
              ora: '21:00',
              setter: (disponibile: boolean) =>
                (this.quartaFasciaNonDisponibile = !disponibile),
            },
          ];

          for (const fascia of fasceOrarie) {
            const chiave = `${data} ${fascia.ora}`;
            const tavoliOccupati = response.data?.[chiave] ?? 0;
            const tavoliDisponibili = tavoliTotali - tavoliOccupati;

            console.log(
              `Fascia ${fascia.ora}: ${tavoliDisponibili} tavoli disponibili su ${tavoliTotali}`
            );

            if (tavoliDisponibili >= numeroTavoliRichiesti) {
              fascia.setter(true); // abilita fascia (disponibile)
            }
          }
        },
        error: (err) => {
          console.error('Errore HTTP nella richiesta tavoliInUso:', err);
        },
      });
  }

  confermaPrenotazione(ora: string) {
    this.prenotazione.numero_persone = this.persone || 0;
    this.prenotazione.data_ora_prenotazione = `${this.dataSelezionata} ${ora}`;
    this.prenotazione.ref_filiale = this.idFiliale;
    this.prenotazione.ref_cliente = 18; 
    console.log('Prenotazione effettuata:', this.prenotazione);
    this.prenotazioneService
      .prenota(this.prenotazione)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          console.log('Risposta prenotazione:', response);
          if (response.success) {
            alert('Prenotazione effettuata con successo!');
          } else {
            alert(
              'Errore durante la prenotazione: ' +
                (response.message || 'Errore sconosciuto')
            );
          }
        },
        error: (err) => {
          console.error('Errore nella richiesta di prenotazione:', err);
          alert('Errore durante la prenotazione. Riprova più tardi.');
        },
      });
  }
}
