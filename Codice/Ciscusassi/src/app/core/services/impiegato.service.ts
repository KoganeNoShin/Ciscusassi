
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

  AddImpiegato(impiegato: ImpiegatoRecord): Observable<ApiResponse<ImpiegatoRecord>> {
    return this.http.post<ApiResponse<ImpiegatoRecord>>(
      `${this.apiURL}/addImpiegato`,
      impiegato
    );
  }

  UpdateImpiegato(
    matricola: number,
    impiegato: ImpiegatoRecord
  ): Observable<ApiResponse<ImpiegatoRecord>> {
    return this.http.put<ApiResponse<ImpiegatoRecord>>(
      `${this.apiURL}/updateImpiegato/${matricola}`,
      impiegato
    );
  }

  DeleteImpiegato(matricola: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiURL}/deleteImpiegato/${matricola}`
    );
  }

  GetImpiegati(): Observable<ApiResponse<ImpiegatoRecord[]>> {
    return this.http.get<ApiResponse<ImpiegatoRecord[]>>(
      `${this.apiURL}/Impiegati`
    );
  }
}






