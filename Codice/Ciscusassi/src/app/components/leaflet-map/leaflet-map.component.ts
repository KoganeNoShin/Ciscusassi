import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import {
	map,
	tileLayer,
	icon,
	marker,
	Map,
	Marker,
	Icon,
	divIcon,
} from 'leaflet';
import { IonSpinner } from '@ionic/angular/standalone';
import { FilialeRecord } from 'src/app/core/interfaces/Filiale';
import { FilialeService } from 'src/app/core/services/filiale.service';
import { ApiResponse } from 'src/app/core/interfaces/ApiResponse';
import { PrenotazioneService } from 'src/app/core/services/prenotazione.service';
import { Router } from '@angular/router';

@Component({
	selector: 'app-leaflet-map',
	templateUrl: './leaflet-map.component.html',
	styleUrls: ['./leaflet-map.component.scss'],
	standalone: true,
	imports: [IonSpinner],
})
export class LeafletMapComponent implements OnInit, OnDestroy {
	private map!: Map;
	loading: boolean = true;
	filiali: FilialeRecord[] = [];
	error: boolean = false;
	@Input() redirect: boolean = false;

	constructor(
		private filialeService: FilialeService,
		private prenotazioneService: PrenotazioneService,
		private router: Router
	) {}

	private handleResponse(response: ApiResponse<FilialeRecord[]>): void {
		console.log(response);

		if (response.success && response.data) {
			this.filiali = response.data;
			setTimeout(() => {
				this.initMap();
			}, 100);
		} else {
			console.error(response.message || 'Errore sconosciuto');
			this.error = true;
		}

		this.loading = false;
	}

	ngOnInit(): void {
		this.filialeService.GetSedi().subscribe({
			next: (response) => this.handleResponse(response),
			error: (err) => {
				console.error(err);
				this.loading = false;
				this.error = true;
			},
		});
	}

	private initMap(): void {
		this.map = map('map').setView([38.105987, 13.350567], 13);

		tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution:
				'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
		}).addTo(this.map);

		this.filiali.forEach((f) => {
			let markerOptions = {
				title: f.indirizzo,
				clickable: true,
				draggable: false,
				icon: divIcon({
					className: 'pin-mappa',
					html: `<div class="marker-img" style="width: 40px; height: 40px; background-size: cover; background-position: center; border-radius: 50%; border: 2px solid black; box-shadow: 0 0 2px rgba(0, 0, 0, 0.2); background-image: url('${f.immagine}')"></div>`,
					iconSize: [40, 40],
					iconAnchor: [20, 40], // optional: aligns bottom of the pin
				}) as Icon,
			};

			console.log(f.immagine);

			let mark = marker([f.latitudine, f.longitudine], markerOptions);

			mark.bindTooltip(f.indirizzo);

			if (this.redirect) {
				mark.bindPopup(`
					<div style="text-align:center">
						<strong>${f.indirizzo}</strong><br/>
						<button class="btn-prenota-filiale" data-id="${f.id_filiale}">
							Prenota
						</button>
					</div>
				`);
			} else {
				mark.addEventListener('click', () => {
					const googleMapsUrl = `https://www.google.com/maps?q=${f.latitudine},${f.longitudine}`;
					window.open(googleMapsUrl, '_blank');
				});
			}

			mark.addTo(this.map);

			mark.on('popupopen', () => {
				setTimeout(() => {
					const btn = document.querySelector(
						`.btn-prenota-filiale[data-id="${f.id_filiale}"]`
					);
					if (btn) {
						btn.addEventListener('click', () => {
							this.salvaFiliale(f.id_filiale);
						});
					}
				}, 0);
			});
		});

		// Forza il ridimensionamento dopo che il DOM è pronto
		setTimeout(() => {
			this.map.invalidateSize();
		}, 100);
	}

	salvaFiliale(id_filiale: number): void {
		this.prenotazioneService.setFilialeId(id_filiale);
		this.router.navigate(['/numero-persone']);
	}

	ngOnDestroy(): void {
		if (this.map) {
			this.map.remove();
		}
	}
}
