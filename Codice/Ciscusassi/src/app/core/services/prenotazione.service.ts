import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../interfaces/ApiResponse';
import { PrenotazioneInput, PrenotazioneInputLoco, PrenotazioneRecord } from '../interfaces/Prenotazione';

@Injectable({
  providedIn: 'root'
})
export class PrenotazioneService {
  private apiURL = environment.apiURL;

  constructor(private http: HttpClient) {}

  getAllPrenotazioni(): Observable<ApiResponse<PrenotazioneRecord[]>> {
    return this.http.get<ApiResponse<PrenotazioneRecord[]>>(`${this.apiURL}/prenotazioni`);
  }

  getPrenotazioneById(id: number): Observable<ApiResponse<PrenotazioneRecord>> {
    return this.http.get<ApiResponse<PrenotazioneRecord>>(`${this.apiURL}/prenotazione/${id}`);
  }

  getPrenotazioniByCliente(clienteId: number): Observable<ApiResponse<PrenotazioneRecord[]>> {
    return this.http.get<ApiResponse<PrenotazioneRecord[]>>(`${this.apiURL}/prenotazioni/cliente/${clienteId}`);
  }

  getPrenotazioniDelGiorno(): Observable<ApiResponse<PrenotazioneRecord[]>> {
    return this.http.get<ApiResponse<PrenotazioneRecord[]>>(`${this.apiURL}/prenotazioni/oggi`);
  }

  getTavoliInUso(): Observable<any> {
    return this.http.get(`${this.apiURL}/tavoli-in-uso`);
  }

  prenota(data: PrenotazioneInput): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiURL}/prenota`, data);
  }

  prenotaLoco(data: PrenotazioneInputLoco): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiURL}/prenotaLoco`, data);
  }

  modificaPrenotazione(data: PrenotazioneRecord): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiURL}/modificaPrenotazione`, data);
  }

  eliminaPrenotazione(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiURL}/eliminaPrenotazione/${id}`);
  }
}
