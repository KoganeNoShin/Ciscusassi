
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../interfaces/ApiResponse';
import { Dipendente} from '../interfaces/Dipendente';

@Injectable({
  providedIn: 'root'
})
export class ServiceDipendentiService {
    private apiURL = environment.apiURL;

  constructor(private http: HttpClient) {}

  GetDipendenti(): Observable<ApiResponse<Dipendente[]>> {
    return this.http.get<ApiResponse<Dipendente[]>>(
      `${this.apiURL}/Dipendenti`
    );
  }
}






