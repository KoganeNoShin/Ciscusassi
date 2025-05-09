import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class PiattoDelGiornoService {

    private port = 8000;
    private baseUrl = `http://localhost:${this.port}`;

    constructor(private http: HttpClient) { }

    GetPiattoDelGiorno(): Observable<any> {
        return this.http.get(`${this.baseUrl}/PiattoDelGiorno`);
    }

}
