import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class LeafletMapService {

    private port = 4200;
    private baseUrl = `http://localhost:${this.port}`;

    constructor(private http: HttpClient) { }

    GetFiliali(): Observable<any> {
        return this.http.get(`${this.baseUrl}/Filiali`);
    }

}
