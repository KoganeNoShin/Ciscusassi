import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class MenuService {

    private port = 4200;
    private baseUrl = `http://localhost:${this.port}`;

    constructor(private http: HttpClient) { }

    GetPiatti(): Observable<any> {
        return this.http.get(`${this.baseUrl}/Prodotti`);
    }

}
