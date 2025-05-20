import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class PrenotaService {
  private apiURL = environment.apiURL;

  constructor(private http: HttpClient) { }

  GetSedi(): Observable<any> {
    return this.http.get(`${this.apiURL}/Filiali`);
  }
}
