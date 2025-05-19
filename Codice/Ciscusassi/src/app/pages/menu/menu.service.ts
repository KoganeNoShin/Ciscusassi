import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.example';

@Injectable({
    providedIn: 'root'
})

export class MenuService {
    
    private apiURL = environment.apiURL;

    constructor(private http: HttpClient) { }

    GetPiatti(): Observable<any> {
        return this.http.get(`${this.apiURL}/Prodotti`);
    }

}
