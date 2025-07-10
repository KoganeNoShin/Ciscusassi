// Importazione dei moduli Angular, Ionic, HTTP e servizi interni
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
	IonRow,
	IonText,
	ToastController,
} from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FilialeRecord } from 'src/app/core/interfaces/Filiale';
import { RouterModule } from '@angular/router';
import { FilialeAsportoService } from 'src/app/core/services/filiale-asporto.service';
import { CarrelloService } from 'src/app/core/services/carrello.service';

@Component({
	selector: 'app-ordina-asporto',
	templateUrl: './ordina-asporto.page.html',
	styleUrls: ['./ordina-asporto.page.scss'],
	standalone: true,
	imports: [
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
	// Variabili di stato per l'interazione utente
	testoRicerca: string = '';
	indirizziTrovati: any[] = [];
	indirizzoSelezionato: string = '';
	coordinateSelezionate: { lat: number; lon: number } | null = null;

	// Dati sulle filiali
	elencoFiliali: FilialeRecord[] = [];
	filialePiuVicino: FilialeRecord | null = null;
	distanzaFilialeMetri: number | null = null;
	tempoViaggioSecondi: number | null = null;
	tempoViaggioMinuti: number | null = null;

	// Stato dell'app
	caricamentoInCorso: boolean = true;
	erroreNellaRichiesta: boolean = false;
	cacheRisultati: Map<string, any[]> = new Map(); // Cache per evitare chiamate duplicate

	// Gestione soggetto reattivo per la ricerca
	private soggettoRicerca = new Subject<string>();
	private chiaveTomTom = environment.tomtomApiKey;

	constructor(
		private servizioFiliale: FilialeService,
		private http: HttpClient,
		private servizioFilialeAsporto: FilialeAsportoService,
		private router: Router,
		private toastController: ToastController,
		private servizioCarrello: CarrelloService
	) {
		// Debounce della ricerca per ridurre le chiamate a TomTom
		this.soggettoRicerca
			.pipe(debounceTime(800), distinctUntilChanged())
			.subscribe((termine) => this.eseguiGeocoding(termine));
	}

	ngOnInit() {
		// Caricamento iniziale delle filiali
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
	 * Avvia la ricerca degli indirizzi tramite geocoding.
	 *
	 * Se il testo inserito dall'utente (`testoRicerca`) contiene almeno 4 caratteri,
	 * viene attivata la ricerca inviando il testo al soggetto `soggettoRicerca`.
	 * Altrimenti, la lista degli indirizzi trovati (`indirizziTrovati`) viene svuotata.
	 */
	avviaRicerca() {
		// Avvia geocoding solo se l'input ha almeno 4 caratteri
		if (this.testoRicerca.length > 3) {
			this.soggettoRicerca.next(this.testoRicerca);
		} else {
			this.indirizziTrovati = [];
		}
	}

	/**
	 * Elabora la risposta ricevuta contenente l'elenco delle filiali.
	 *
	 * Se la risposta è valida, salva l'elenco delle filiali e, se sono disponibili
	 * delle coordinate selezionate, cerca la filiale più vicina. In caso di errore,
	 * imposta lo stato di errore e registra il messaggio di errore nella console.
	 * Alla fine dell'elaborazione, aggiorna lo stato di caricamento.
	 *
	 * @param risposta Oggetto contenente il risultato della richiesta delle filiali.
	 */
	private async processaRispostaFiliali(risposta: any) {
		// Salva filiali e trova quella più vicina se coordinate disponibili
		if (risposta.success && risposta.data) {
			this.elencoFiliali = risposta.data;
			if (this.coordinateSelezionate) {
				await this.trovaFilialePiuVicina(this.coordinateSelezionate);
			}
		} else {
			console.error(
				'Errore nel recupero filiali:',
				risposta.message || 'Messaggio non disponibile'
			);
			this.erroreNellaRichiesta = true;
		}
		this.caricamentoInCorso = false;
	}

	/**
	 * Esegue il geocoding di un indirizzo utilizzando la TomTom Search API.
	 *
	 * - Se l'indirizzo è già stato cercato in precedenza (cache), restituisce i risultati memorizzati.
	 * - Altrimenti, effettua una richiesta HTTP alla TomTom Search API per ottenere i risultati di geocoding.
	 * - I risultati trovati vengono salvati sia nella proprietà `indirizziTrovati` che nella cache locale.
	 *
	 * @param indirizzo L'indirizzo da geocodificare.
	 */
	private eseguiGeocoding(indirizzo: string) {
		// Controlla se la ricerca è già stata fatta (cache)
		const chiaveRicerca = indirizzo.trim().toLowerCase();
		if (this.cacheRisultati.has(chiaveRicerca)) {
			this.indirizziTrovati =
				this.cacheRisultati.get(chiaveRicerca) || [];
			return;
		}

		// Chiamata a TomTom Search API
		const url = `https://api.tomtom.com/search/2/search/${encodeURIComponent(
			indirizzo
		)}.json?key=${this.chiaveTomTom}&limit=2&countrySet=IT`;

		this.http.get<any>(url).subscribe((risposta) => {
			const risultati = risposta.results || [];
			this.indirizziTrovati = risultati;
			this.cacheRisultati.set(chiaveRicerca, risultati);
		});
	}

	/**
	 * Calcola il percorso tra una destinazione e un'origine utilizzando la Routing API di TomTom.
	 *
	 * @param destinazione - Oggetto contenente la latitudine e longitudine della destinazione.
	 * @param origine - Oggetto contenente la latitudine e longitudine dell'origine.
	 * @param traffico - (Opzionale) Se true, considera le condizioni di traffico nel calcolo del percorso. Default: false.
	 * @returns Una Promise che restituisce un oggetto con la distanza (in metri) e il tempo di percorrenza (in secondi).
	 * @throws Errore se i dati del percorso non sono disponibili.
	 */
	private ottieniDatiPercorso(
		destinazione: { lat: number; lon: number },
		origine: { lat: number; lon: number },
		traffico: boolean = false
	): Promise<{ distanza: number; tempo: number }> {
		// Calcola percorso tra utente e filiale usando Routing API
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
	 * Trova la filiale più vicina al punto di partenza specificato, calcolando sia la distanza che il tempo di viaggio.
	 *
	 * @param puntoPartenza - Oggetto contenente le coordinate di partenza (latitudine e longitudine).
	 *
	 * @remarks
	 * - Se l'elenco delle filiali (`elencoFiliali`) è vuoto o non definito, i dati relativi alla filiale più vicina vengono azzerati.
	 * - Per ogni filiale, viene calcolato il percorso dal punto di partenza utilizzando il metodo `ottieniDatiPercorso`.
	 * - Tra tutte le filiali con percorso valido, viene selezionata quella con il tempo di viaggio minimo.
	 * - I dati della filiale più vicina, la distanza in metri e il tempo di viaggio (in secondi e minuti) vengono salvati nelle rispettive proprietà della classe.
	 * - In caso di errore nel calcolo del percorso per una filiale, l'errore viene loggato e la filiale viene ignorata.
	 */
	async trovaFilialePiuVicina(puntoPartenza: { lat: number; lon: number }) {
		if (!this.elencoFiliali || this.elencoFiliali.length === 0) {
			this.filialePiuVicino = null;
			this.distanzaFilialeMetri = null;
			this.tempoViaggioSecondi = null;
			this.tempoViaggioMinuti = null;
			return;
		}

		// Calcola distanza e tempo per ogni filiale
		const promises = this.elencoFiliali.map(async (filiale) => {
			try {
				const datiPercorso = await this.ottieniDatiPercorso(
					puntoPartenza,
					{
						lat: filiale.latitudine,
						lon: filiale.longitudine,
					}
				);
				return {
					filiale,
					tempo: datiPercorso.tempo,
					distanza: datiPercorso.distanza,
				};
			} catch (err) {
				console.error(
					'Errore calcolo percorso per filiale',
					filiale,
					err
				);
				return null;
			}
		});

		// Filtra risultati validi e seleziona il più vicino
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

		// Salva i dati della filiale selezionata
		this.filialePiuVicino = filialePiùVicina;
		this.distanzaFilialeMetri = distanzaMinima;
		this.tempoViaggioSecondi = tempoMinimo;
		this.tempoViaggioMinuti = Math.round(tempoMinimo / 60);
	}

	/**
	 * Seleziona un indirizzo tra quelli trovati e aggiorna le proprietà correlate.
	 *
	 * @param indirizzo Oggetto contenente le informazioni dell'indirizzo selezionato, inclusi address e position.
	 *
	 * Imposta:
	 * - `indirizzoSelezionato` con l'indirizzo formattato (freeformAddress o streetName).
	 * - `coordinateSelezionate` con latitudine e longitudine dell'indirizzo.
	 * - `testoRicerca` con l'indirizzo selezionato.
	 * - Svuota la lista `indirizziTrovati`.
	 */
	selezionaIndirizzo(indirizzo: any) {
		this.indirizzoSelezionato =
			indirizzo.address.freeformAddress ||
			indirizzo.address.streetName ||
			'';
		this.coordinateSelezionate = {
			lat: indirizzo.position.lat,
			lon: indirizzo.position.lon,
		};
		this.testoRicerca = this.indirizzoSelezionato;
		this.indirizziTrovati = [];
	}

	/**
	 * Gestisce la selezione della filiale più vicina e verifica se è idonea per l’asporto.
	 *
	 * Questa funzione viene chiamata quando l’utente seleziona un indirizzo.
	 * Se viene trovata una filiale vicina, salva le informazioni sulla filiale nel servizio
	 * `servizioFilialeAsporto`, controlla la distanza in minuti, e decide se reindirizzare
	 * l’utente alla pagina del menu d’asporto oppure mostrare un messaggio di avviso.
	 *
	 * @async
	 * @returns {Promise<void>} - Non restituisce alcun valore, ma può produrre side-effect
	 * come navigazione o visualizzazione di toast.
	 *
	 * @remarks
	 * - Se la filiale più vicina (`this.filialePiuVicino`) è presente, viene salvata
	 *   nel servizio con il tempo di viaggio stimato e l'indirizzo selezionato.
	 * - Se il tempo di viaggio è inferiore a 30 minuti, l’utente viene reindirizzato
	 *   alla pagina `/menu-asporto`.
	 * - Se il tempo di viaggio è superiore o uguale a 30 minuti, viene mostrato un
	 *   messaggio di avviso tramite un toast.
	 * - Se non è stata trovata o selezionata alcuna filiale, viene registrato un
	 *   messaggio nel log di console.
	 */
	async svuotaCampo() {
		if (this.filialePiuVicino) {
			console.log(
				'✅ Filiale più vicina selezionata:',
				this.filialePiuVicino
			);
			console.log(
				'📍 Indirizzo selezionato da utente:',
				this.indirizzoSelezionato
			);

			// Salva filiale selezionata nel servizio
			this.servizioFilialeAsporto.setFiliale(
				this.filialePiuVicino,
				this.tempoViaggioMinuti,
				this.indirizzoSelezionato
			);

			// Controlla se la distanza è accettabile per l’asporto
			if (
				this.tempoViaggioMinuti !== undefined &&
				this.tempoViaggioMinuti !== null
			) {
				if (this.tempoViaggioMinuti < 30) {
					this.router.navigateByUrl('/menu-asporto', {
						replaceUrl: true,
					});
				} else {
					const toast = await this.toastController.create({
						message:
							'Ci dispiace ma la località selezionata è troppo lontana.',
						duration: 3000,
						position: 'bottom',
						color: 'warning',
					});
					await toast.present();
				}
			}
		} else {
			console.log('⚠️ Nessuna filiale trovata o selezionata.');
		}
	}

	/**
	 * Procede con il flusso di selezione della filiale per l'asporto.
	 *
	 * Questa funzione viene invocata dopo che l'utente ha selezionato un indirizzo e intende continuare.
	 * Verifica la presenza di errori nella richiesta, gestisce il caricamento, cerca la filiale più vicina
	 * rispetto alle coordinate selezionate, svuota il carrello, pulisce gli input e avvia il flusso
	 * di navigazione o mostra un messaggio d’errore sulla distanza.
	 *
	 * @async
	 * @returns {Promise<void>} - Non restituisce alcun valore, ma modifica lo stato dell’app e può navigare o mostrare toast.
	 *
	 * @remarks
	 * - Se `erroreNellaRichiesta` è `true`, viene mostrato un messaggio di errore e il flusso viene interrotto.
	 * - Se sono presenti `coordinateSelezionate`, viene cercata la filiale più vicina tramite `trovaFilialePiuVicina`,
	 *   e il carrello viene svuotato.
	 * - Vengono poi resettati i campi di input (`testoRicerca`, `indirizziTrovati`, `coordinateSelezionate`).
	 * - Infine, viene invocata `svuotaCampo()` per gestire la logica di navigazione o eventuale messaggio d’avviso
	 *   in base alla distanza della filiale.
	 */
	async procedi() {
		if (this.erroreNellaRichiesta) {
			const toast = await this.toastController.create({
				message: 'Errore nella richiesta, riprova più tardi.',
				duration: 3000,
				position: 'bottom',
				color: 'danger',
			});
			await toast.present();
			return;
		} else if (this.coordinateSelezionate) {
			this.caricamentoInCorso = true;
			await this.trovaFilialePiuVicina(this.coordinateSelezionate);
			this.caricamentoInCorso = false;

			// Reset del carrello prima di procedere
			this.servizioCarrello.svuotaCarrello();
		}

		// Pulizia degli input
		this.testoRicerca = '';
		this.indirizziTrovati = [];
		this.coordinateSelezionate = null;

		// Avvio della logica successiva (navigazione o errore distanza)
		await this.svuotaCampo();
	}
}
