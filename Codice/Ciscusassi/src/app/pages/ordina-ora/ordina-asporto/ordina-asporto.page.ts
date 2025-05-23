import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
	IonButton,
	IonCard,
	IonCol,
	IonContent,
	IonGrid,
	IonHeader,
	IonImg,
	IonInput,
	IonRadio,
	IonRow,
	IonText,
	IonTitle,
	IonToolbar,
	IonDatetime,
	IonModal,
	IonDatetimeButton,
	IonItem,
	IonLabel,
	IonList,
	IonCardHeader,
	IonCardTitle,
	IonCardContent,
} from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';
import { debounceTime, Subject, distinctUntilChanged } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Router, RouterModule } from '@angular/router';

@Component({
	selector: 'app-ordina-asporto',
	templateUrl: './ordina-asporto.page.html',
	styleUrls: ['./ordina-asporto.page.scss'],
	standalone: true,
	imports: [
		IonCardContent,
		IonList,
		IonItem,
		IonDatetimeButton,
		IonModal,
		IonDatetime,
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
		FormsModule,
		RouterModule
	],
})
export class OrdinaAsportoPage implements OnInit {
	searchTerm = '';
	results: any[] = [];
	selectedAddress = '';
	selectedCoords: { lat: number; lon: number } | null = null;

	private searchSubject = new Subject<string>();
	private tomtomApiKey = environment.tomtomApiKey;

	constructor(private http: HttpClient) {
		this.searchSubject
			.pipe(debounceTime(800), distinctUntilChanged())
			.subscribe((term) => {
				this.geocode(term);
			});
	}

	ngOnInit() {}

	onSearch() {
		if (this.searchTerm.length > 3) {
			this.searchSubject.next(this.searchTerm);
		} else {
			this.results = [];
		}
	}

	private cache = new Map<string, any[]>();

	geocode(query: string) {
		const normalizedQuery = query.trim().toLowerCase();

		if (this.cache.has(normalizedQuery)) {
			this.results = this.cache.get(normalizedQuery) || [];
			return;
		}

		const url = `https://api.tomtom.com/search/2/search/${encodeURIComponent(query)}%20Palermo.json?key=${this.tomtomApiKey}&limit=2&countrySet=IT`;

		this.http.get<any>(url).subscribe((response) => {
			const results = response.results || [];
			this.results = results;
			this.cache.set(normalizedQuery, results);
		});
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
	}
}
