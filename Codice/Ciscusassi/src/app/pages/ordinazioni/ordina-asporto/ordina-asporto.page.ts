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
	testoRicerca: string = '';
	indirizziTrovati: any[] = [];
	indirizzoSelezionato: string = '';
	coordinateSelezionate: { lat: number; lon: number } | null = null;

	elencoFiliali: FilialeRecord[] = [];
	filialePiuVicino: FilialeRecord | null = null;
	distanzaFilialeMetri: number | null = null;
	tempoViaggioSecondi: number | null = null;
	tempoViaggioMinuti: number | null = null;

	caricamentoInCorso: boolean = true;
	erroreNellaRichiesta: boolean = false;
	cacheRisultati: Map<string, any[]> = new Map();

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
		this.soggettoRicerca
			.pipe(debounceTime(800), distinctUntilChanged())
			.subscribe((termine) => this.eseguiGeocoding(termine));
	}

	ngOnInit() {
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
		if (this.testoRicerca.length > 3) {
			this.soggettoRicerca.next(this.testoRicerca);
		} else {
			this.indirizziTrovati = [];
		}
	}

	private async processaRispostaFiliali(risposta: any) {
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
		const chiaveRicerca = indirizzo.trim().toLowerCase();
		if (this.cacheRisultati.has(chiaveRicerca)) {
			this.indirizziTrovati =
				this.cacheRisultati.get(chiaveRicerca) || [];
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

			this.servizioFilialeAsporto.setFiliale(
				this.filialePiuVicino,
				this.tempoViaggioMinuti,
				this.indirizzoSelezionato
			);

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

	async procedi() {
		if (this.coordinateSelezionate) {
			this.caricamentoInCorso = true;
			await this.trovaFilialePiuVicina(this.coordinateSelezionate);
			this.caricamentoInCorso = false;
			this.servizioCarrello.svuotaCarrello();
		}

		// Pulizia campi input
		this.testoRicerca = '';
		this.indirizziTrovati = [];
		this.coordinateSelezionate = null;

		// Chiamata aggiornata (con await)
		await this.svuotaCampo();
	}
}
