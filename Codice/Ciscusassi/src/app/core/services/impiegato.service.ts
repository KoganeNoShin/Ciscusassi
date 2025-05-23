
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../interfaces/ApiResponse';
import { ImpiegatoRecord } from '../interfaces/Impiegato';

@Injectable({
  providedIn: 'root'
})

export class ImpiegatoService {
    private apiURL = environment.apiURL;

  constructor(private http: HttpClient) {}

  GetImpiegati(): Observable<ApiResponse<ImpiegatoRecord[]>> {
    return this.http.get<ApiResponse<ImpiegatoRecord[]>>(
      `${this.apiURL}/Impiegati`
    );
  }
}






