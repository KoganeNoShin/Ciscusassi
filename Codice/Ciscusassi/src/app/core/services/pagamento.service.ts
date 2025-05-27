import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../interfaces/ApiResponse';
import { PagamentoMensile } from '../interfaces/Pagamento';

@Injectable({
  providedIn: 'root'
})
export class PagamentoService {
	private apiURL = environment.apiURL;

  constructor(private http: HttpClient) {}

  GetUtiliMensili(year: number): Observable<ApiResponse<PagamentoMensile[]>> {
      return this.http.get<ApiResponse<PagamentoMensile[]>>(
        `${this.apiURL}/pagamenti/${year}`
      );
  }
}
