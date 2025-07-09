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

	avviaRicerca() {
		// Avvia geocoding solo se l'input ha almeno 4 caratteri
		if (this.testoRicerca.length > 3) {
			this.soggettoRicerca.next(this.testoRicerca);
		} else {
			this.indirizziTrovati = [];
		}
	}

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

	private eseguiGeocoding(indirizzo: string) {
		// Controlla se la ricerca è già stata fatta (cache)
		const chiaveRicerca = indirizzo.trim().toLowerCase();
		if (this.cacheRisultati.has(chiaveRicerca)) {
			this.indirizziTrovati =
				this.cacheRisultati.get(chiaveRicerca) || [];
			return;
		}

		// Chiamata a TomTom Search API a Palermo, raggio di 160 km dal centro 
		const url = `https://api.tomtom.com/search/2/search/${encodeURIComponent(
			indirizzo
		)}.json?key=${this.chiaveTomTom}&limit=2&countrySet=IT&lat=38.1157&lon=13.3615&radius=160000`;

		this.http.get<any>(url).subscribe((risposta) => {
			const risultati = risposta.results || [];
			this.indirizziTrovati = risultati;
			this.cacheRisultati.set(chiaveRicerca, risultati);
		});
	}

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

	// Trova la filiale con il tempo di percorrenza minore
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

	// Quando l'utente seleziona un indirizzo dai suggerimenti
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

	// Imposta la filiale e gestisce la logica di navigazione in base al tempo di consegna
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
					this.router.navigate(['/menu-asporto']);
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

	// Metodo principale chiamato quando l’utente preme "Procedi"
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
