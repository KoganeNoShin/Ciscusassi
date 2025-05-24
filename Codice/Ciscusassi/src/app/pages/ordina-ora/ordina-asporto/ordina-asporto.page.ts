import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilialeService } from 'src/app/core/services/filiale.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonCol,
  IonContent,
  IonGrid,
  IonInput,
  IonList,
  IonItem,
  IonImg,
  IonCardContent,
  IonRow,
  IonText,
  ToastController
} from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';
import { async, debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FilialeRecord } from 'src/app/core/interfaces/Filiale';
import { RouterModule } from '@angular/router';
import { FilialeAsportoService } from 'src/app/core/services/filiale-asporto.service';

@Component({
  selector: 'app-ordina-asporto',
  templateUrl: './ordina-asporto.page.html',
  styleUrls: ['./ordina-asporto.page.scss'],
  standalone: true,
  imports: [
    IonCardContent,
    IonImg,
    IonItem,
    IonList,
    IonInput,
    IonContent,
    CommonModule,
    FormsModule,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonText,
    IonButton,
    RouterModule,
  ],
})
export class OrdinaAsportoPage implements OnInit {
  // Termini e dati di ricerca
  testoRicerca: string = '';
  indirizziTrovati: any[] = [];
  indirizzoSelezionato: string = '';
  coordinateSelezionate: { lat: number; lon: number } | null = null;

  // Lista filiali e filiale più vicina con informazioni
  elencoFiliali: FilialeRecord[] = [];
  filialePiuVicino: FilialeRecord | null = null;
  distanzaFilialeMetri: number | null = null;
  tempoViaggioSecondi: number | null = null;
  tempoViaggioMinuti: number | null = null;

  // Stato caricamento e errori
  caricamentoInCorso: boolean = true;
  erroreNellaRichiesta: boolean = false;

  // Cache per risultati geocoding
  cacheRisultati: Map<string, any[]> = new Map();

  // Debounce per ricerca input
  private soggettoRicerca = new Subject<string>();

  private chiaveTomTom = environment.tomtomApiKey;

  constructor(
    private servizioFiliale: FilialeService,
    private http: HttpClient,
    private servizioFilialeAsporto: FilialeAsportoService,
	private router: Router,
	private toastController: ToastController
  ) {
    // Imposto debounce per la ricerca per ridurre chiamate API
    this.soggettoRicerca
      .pipe(debounceTime(800), distinctUntilChanged())
      .subscribe((termine) => this.eseguiGeocoding(termine));
  }

  ngOnInit() {
    // Carico elenco filiali da backend all'inizializzazione
    this.servizioFiliale.GetSedi().subscribe({
      next: (risposta) => this.processaRispostaFiliali(risposta),
      error: (err) => {
        console.error('Errore caricamento filiali:', err);
        this.caricamentoInCorso = false;
        this.erroreNellaRichiesta = true;
      },
    });
	
  }

  /**
   * Metodo invocato dall'input di ricerca indirizzi
   */
  avviaRicerca() {
    if (this.testoRicerca.length > 3) {
      this.soggettoRicerca.next(this.testoRicerca);
    } else {
      this.indirizziTrovati = [];
    }
  }

  /**
   * Gestione risposta elenco filiali
   */
  private async processaRispostaFiliali(risposta: any) {
    if (risposta.success && risposta.data) {
      this.elencoFiliali = risposta.data;
      // Se coordinate selezionate, calcolo la filiale più vicina
      if (this.coordinateSelezionate) {
        await this.trovaFilialePiuVicina(this.coordinateSelezionate);
      }
    } else {
      console.error('Errore nel recupero filiali:', risposta.message || 'Messaggio non disponibile');
      this.erroreNellaRichiesta = true;
    }
    this.caricamentoInCorso = false;
  }

  /**
   * Effettua la ricerca geocoding con TomTom API
   */
  private eseguiGeocoding(indirizzo: string) {
    const chiaveRicerca = indirizzo.trim().toLowerCase();

    // Uso cache per evitare chiamate ripetute
    if (this.cacheRisultati.has(chiaveRicerca)) {
      this.indirizziTrovati = this.cacheRisultati.get(chiaveRicerca) || [];
      return;
    }

    const url = `https://api.tomtom.com/search/2/search/${encodeURIComponent(
      indirizzo
    )}%20Palermo.json?key=${this.chiaveTomTom}&limit=2&countrySet=IT`;

    this.http.get<any>(url).subscribe((risposta) => {
      const risultati = risposta.results || [];
      this.indirizziTrovati = risultati;
      this.cacheRisultati.set(chiaveRicerca, risultati);
    });
  }

  /**
   * Ottiene dati di percorso (distanza e tempo) tra origine e destinazione
   */
  private ottieniDatiPercorso(
    destinazione: { lat: number; lon: number },
    origine: { lat: number; lon: number },
    traffico: boolean = false
  ): Promise<{ distanza: number; tempo: number }> {
    const baseUrl = 'https://api.tomtom.com/routing/1/calculateRoute';
    const origineStr = `${origine.lat},${origine.lon}`;
    const destinazioneStr = `${destinazione.lat},${destinazione.lon}`;
    const url = `${baseUrl}/${origineStr}:${destinazioneStr}/json?key=${this.chiaveTomTom}&computeTravelTimeFor=all&traffic=${traffico}`;

    return this.http
      .get<any>(url)
      .toPromise()
      .then((risposta) => {
        if (risposta.routes && risposta.routes.length > 0) {
          const sommario = risposta.routes[0].summary;
          return {
            distanza: sommario.lengthInMeters,
            tempo: sommario.travelTimeInSeconds,
          };
        }
        throw new Error('Dati percorso non disponibili');
      });
  }

  /**
   * Cerca la filiale più vicina in termini di tempo di viaggio da una posizione
   * Ottimizzato per chiamate parallele (più veloce)
   */
  async trovaFilialePiuVicina(puntoPartenza: { lat: number; lon: number }) {
    if (!this.elencoFiliali || this.elencoFiliali.length === 0) {
      this.filialePiuVicino = null;
      this.distanzaFilialeMetri = null;
      this.tempoViaggioSecondi = null;
      this.tempoViaggioMinuti = null;
      return;
    }

    const promises = this.elencoFiliali.map(async (filiale) => {
      try {
        const datiPercorso = await this.ottieniDatiPercorso(puntoPartenza, {
          lat: filiale.latitudine,
          lon: filiale.longitudine,
        });
        return {
          filiale,
          tempo: datiPercorso.tempo,
          distanza: datiPercorso.distanza,
        };
      } catch (err) {
        console.error('Errore calcolo percorso per filiale', filiale, err);
        return null;
      }
    });

    const risultati = await Promise.all(promises);
    const validi = risultati.filter((r) => r !== null) as {
      filiale: FilialeRecord;
      tempo: number;
      distanza: number;
    }[];

    if (validi.length === 0) {
      this.filialePiuVicino = null;
      this.distanzaFilialeMetri = null;
      this.tempoViaggioSecondi = null;
      this.tempoViaggioMinuti = null;
      return;
    }

    let filialePiùVicina = validi[0].filiale;
    let tempoMinimo = validi[0].tempo;
    let distanzaMinima = validi[0].distanza;

    for (const r of validi) {
      if (r.tempo < tempoMinimo) {
        tempoMinimo = r.tempo;
        distanzaMinima = r.distanza;
        filialePiùVicina = r.filiale;
      }
    }

    this.filialePiuVicino = filialePiùVicina;
    this.distanzaFilialeMetri = distanzaMinima;
    this.tempoViaggioSecondi = tempoMinimo;
    this.tempoViaggioMinuti = Math.round(tempoMinimo / 60);
  }

  /**
   * Seleziona un indirizzo dai risultati della ricerca
   */
  selezionaIndirizzo(indirizzo: any) {
    this.indirizzoSelezionato =
      indirizzo.address.freeformAddress || indirizzo.address.streetName || '';
    this.coordinateSelezionate = {
      lat: indirizzo.position.lat,
      lon: indirizzo.position.lon,
    };
    this.testoRicerca = this.indirizzoSelezionato;
    this.indirizziTrovati = [];
  }

  /**
   * Funzione per svuotare il campo e impostare la filiale più vicina nel servizio
   * Mantiene il nome come richiesto.
   */
  async svuotaCampo() {
  if (this.filialePiuVicino) {
    console.log('Filiale più vicina selezionata:', this.filialePiuVicino);
    console.log(
      'Tempo di viaggio stimato (minuti):',
      this.tempoViaggioMinuti ?? 'Non disponibile'
    );

    this.servizioFilialeAsporto.setFiliale(
      this.filialePiuVicino,
      this.tempoViaggioMinuti
    );

    if (this.tempoViaggioMinuti !== undefined && this.tempoViaggioMinuti !== null) {
      if (this.tempoViaggioMinuti < 30) {
        console.log(true);
        this.router.navigate(['/menu-asporto']);
      } else {
        const toast = await this.toastController.create({
          message: 'Ci dispiace ma la località selezionata è troppo lontana, non possiamo consegnare fin lì.',
          duration: 3000,
          position: 'bottom',
          color: 'warning',
        });
        await toast.present();
      }
    }
  } else {
    console.log('Nessuna filiale trovata o selezionata.');
  }
}


  async procedi() {
    if (this.coordinateSelezionate) {
      this.caricamentoInCorso = true; // blocca bottone o mostra loader se vuoi
      await this.trovaFilialePiuVicina(this.coordinateSelezionate);
      this.caricamentoInCorso = false;
    }

    // Ora che la filiale più vicina è aggiornata, puoi pulire il campo
    this.testoRicerca = ''; // Pulisce il campo input
    this.indirizzoSelezionato = ''; // Pulisce l'indirizzo selezionato
    this.coordinateSelezionate = null;
    this.indirizziTrovati = [];

    this.svuotaCampo(); // mantiene la tua logica di invio dati
  }

}
