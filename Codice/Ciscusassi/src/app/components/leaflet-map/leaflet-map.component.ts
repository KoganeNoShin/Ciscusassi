import { Component, OnInit, OnDestroy } from '@angular/core';
import { map, tileLayer, icon, marker, Map, Marker, Icon, divIcon } from 'leaflet';
import { IonSpinner } from '@ionic/angular/standalone';
import { Filiale } from 'src/app/core/interfaces/Filiale';
import { LeafletMapService } from './leaflet-map.service';

@Component({
	selector: 'app-leaflet-map',
	templateUrl: './leaflet-map.component.html',
	styleUrls: ['./leaflet-map.component.scss'],
	standalone: true,
	imports: [IonSpinner]
})
export class LeafletMapComponent implements OnInit, OnDestroy {

	private map!: Map;
	loading: boolean = true;
	filiali: Filiale[] = [];

	constructor(private leafletMapService: LeafletMapService) { }

	ngOnInit(): void {
		this.leafletMapService.GetFiliali().subscribe({
			next: (response) => {
				console.log(response);
				this.filiali = response;
				this.loading = false;

				setTimeout(() => {
					this.initMap();
				}, 100);
			},
			error: (err) => {
				console.error(err);
				this.loading = false;
			}
		});
	}

	private initMap(): void {
		this.map = map('map').setView([38.105987, 13.350567], 10);

		tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
		}).addTo(this.map);

		this.filiali.forEach(f => {

			let markerOptions = {
				title: f.indirizzo,
				clickable: true,
				draggable: false,
				icon: divIcon({
					className: "pin-mappa",
					html: `<div class="marker-img" style="width: 40px; height: 40px; background-size: cover; background-position: center; border-radius: 50%; border: 2px solid black; box-shadow: 0 0 2px rgba(0, 0, 0, 0.2); background-image: url('data:image/png;base64,${f.immagine}')"></div>`,
					iconSize: [40, 40],
					iconAnchor: [20, 40], // optional: aligns bottom of the pin
				}) as Icon
			};

			console.log(f.immagine);

			let mark = marker([f.latitudine, f.longitudine], markerOptions);
			mark.bindTooltip(f.indirizzo);
			mark.addTo(this.map);
		});

		// Forza il ridimensionamento dopo che il DOM è pronto
		setTimeout(() => {
			this.map.invalidateSize();
		}, 100);
	}

	ngOnDestroy(): void {
		if (this.map) {
			this.map.remove();
		}
	}

}
