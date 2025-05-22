import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
	providedIn: 'root',
})
export class LeafletMapService {
	private apiURL = environment.apiURL;

	constructor(private http: HttpClient) {}

	GetFiliali(): Observable<any> {
		return this.http.get(`${this.apiURL}/Filiali`);
	}
}
