import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilialeService } from 'src/app/core/services/filiale.service';
import { FormsModule } from '@angular/forms';
import {
	IonButton,
	IonCard,
	IonCol,
	IonContent,
	IonGrid,
	IonInput,
	IonList,
	IonModal,
	IonRow,
	IonText,
	IonDatetimeButton,
	IonDatetime,
	IonItem,
	IonImg,
	IonCardContent,
} from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';
import { debounceTime, Subject, distinctUntilChanged } from 'rxjs';
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
		RouterModule
	],
})
export class OrdinaAsportoPage implements OnInit {
	searchTerm = '';
	results: any[] = [];
	selectedAddress = '';
	selectedCoords: { lat: number; lon: number } | null = null;
	indirizzoScelto = '';
	distanceInfo: any = null;
	filiali: FilialeRecord[] = [];
	closestFiliale: FilialeRecord | null = null;
	closestDistanceMeters: number | null = null;
	closestTravelTimeSeconds: number | null = null;
	travelTimeMinutes: number | null = null; // <-- Variabile aggiunta

	private searchSubject = new Subject<string>();
	private tomtomApiKey = environment.tomtomApiKey;

	loading = true;
	error = false;

	constructor(
		private filialeService: FilialeService,
		private http: HttpClient,
		private filialeAsportoService: FilialeAsportoService

	) {
		this.searchSubject
			.pipe(debounceTime(800), distinctUntilChanged())
			.subscribe((term) => {
				this.geocode(term);
			});
	}

	ngOnInit() {
		this.filialeService.GetSedi().subscribe({
			next: (response) => this.handleResponse(response),
			error: (err) => {
				console.log(err);
				this.loading = false;
				this.error = true;
			},
		});
	}

	onSearch() {
		if (this.searchTerm.length > 3) {
			this.searchSubject.next(this.searchTerm);
		} else {
			this.results = [];
		}
	}

	private cache = new Map<string, any[]>();

	private handleResponse(response: any) {
		if (response.success && response.data) {
			this.filiali = response.data;
			const referencePoint = { lat: 38.1157, lon: 13.3615 }; // Centro Palermo
			this.findClosestFilialeByTravelTime(referencePoint);
		} else {
			console.error(response.message || 'Errore sconosciuto');
			this.error = true;
		}
		this.loading = false;
	}

	geocode(query: string) {
		const normalizedQuery = query.trim().toLowerCase();

		if (this.cache.has(normalizedQuery)) {
			this.results = this.cache.get(normalizedQuery) || [];
			return;
		}

		const url = `https://api.tomtom.com/search/2/search/${encodeURIComponent(query)}%20Palermo.json?key=${this.tomtomApiKey}&limit=5&countrySet=IT`;

		this.http.get<any>(url).subscribe((response) => {
			const results = response.results || [];
			this.results = results;
			this.cache.set(normalizedQuery, results);
		});
	}

	private getRouteData(
		origin: { lat: number; lon: number },
		destination: { lat: number; lon: number },
		traffic: boolean = false
	): Promise<{ distance: number; travelTime: number }> {
		const baseUrl = 'https://api.tomtom.com/routing/1/calculateRoute';
		const originStr = `${origin.lat},${origin.lon}`;
		const destinationStr = `${destination.lat},${destination.lon}`;
		const url = `${baseUrl}/${originStr}:${destinationStr}/json?key=${this.tomtomApiKey}&computeTravelTimeFor=all&traffic=${traffic}`;

		return this.http
			.get<any>(url)
			.toPromise()
			.then((response) => {
				if (response.routes && response.routes.length > 0) {
					const summary = response.routes[0].summary;
					return {
						distance: summary.lengthInMeters,
						travelTime: summary.travelTimeInSeconds,
					};
				}
				throw new Error('No route data');
			});
	}

	async findClosestFilialeByTravelTime(origin: { lat: number; lon: number }) {
		if (!this.filiali || this.filiali.length === 0) {
			this.closestFiliale = null;
			this.closestDistanceMeters = null;
			this.closestTravelTimeSeconds = null;
			this.travelTimeMinutes = null;
			return;
		}

		let closest: FilialeRecord | null = null;
		let minTravelTime = Number.MAX_SAFE_INTEGER;
		let minDistance = Number.MAX_SAFE_INTEGER;

		for (const filiale of this.filiali) {
			try {
				const routeData = await this.getRouteData(origin, {
					lat: filiale.latitudine,
					lon: filiale.longitudine,
				});
				if (routeData.travelTime < minTravelTime) {
					minTravelTime = routeData.travelTime;
					minDistance = routeData.distance;
					closest = filiale;
				}
			} catch (error) {
				console.error('Errore nel calcolo percorso:', error);
			}
		}

		this.closestFiliale = closest;
		this.closestDistanceMeters =
			minDistance === Number.MAX_SAFE_INTEGER ? null : minDistance;
		this.closestTravelTimeSeconds =
			minTravelTime === Number.MAX_SAFE_INTEGER ? null : minTravelTime;

		this.travelTimeMinutes = this.closestTravelTimeSeconds
			? Math.round(this.closestTravelTimeSeconds / 60)
			: null;
	}

	selectPlace(place: any) {
		this.selectedAddress =
			place.address.freeformAddress || place.address.streetName || '';
		this.selectedCoords = {
			lat: place.position.lat,
			lon: place.position.lon,
		};
		this.searchTerm = this.selectedAddress;
		this.results = [];

		if (this.selectedCoords) {
			this.findClosestFilialeByTravelTime(this.selectedCoords);
		}
	}

	svuotaCampo() {
		this.indirizzoScelto = this.selectedAddress;
		this.searchTerm = '';
		this.selectedAddress = '';
		this.selectedCoords = null;
		this.results = [];
		this.distanceInfo = null;

		if (this.closestFiliale) {
			console.log('Filiale più vicina:', this.closestFiliale);
			console.log('Tempo di viaggio (minuti):', this.travelTimeMinutes ?? 'N/A');
			this.filialeAsportoService.setFiliale(this.closestFiliale, this.travelTimeMinutes);
		} else {
			console.log('Nessuna filiale trovata o selezionata.');
		}
	}
}
