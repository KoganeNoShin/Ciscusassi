import { Injectable } from '@angular/core';
import { FilialeRecord } from 'src/app/core/interfaces/Filiale';

@Injectable({
	providedIn: 'root',
})
export class FilialeAsportoService {
	private _closestFiliale: FilialeRecord | null = null;
	private _travelTimeMinutes: number | null = null;

	setFiliale(filiale: FilialeRecord | null, travelTime: number | null): void {
		this._closestFiliale = filiale;
		this._travelTimeMinutes = travelTime;
	}

	get closestFiliale(): FilialeRecord | null {
		return this._closestFiliale;
	}

	get travelTimeMinutes(): number | null {
		return this._travelTimeMinutes;
	}

	clear(): void {
		this._closestFiliale = null;
		this._travelTimeMinutes = null;
	}
}
