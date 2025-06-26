import { Injectable } from '@angular/core';

export interface Tavolo {
  numero: number;
  nome: string;
  orario: string;
  persone: number;
  stato: string;
}

@Injectable({
  providedIn: 'root'
})
export class TavoloService {
  tavolo: Tavolo | null = null;
  constructor() { }

  setTavolo(tavolo: Tavolo){
	this.tavolo = tavolo;
  }

  getTavolo(): Tavolo | null{
    return this.tavolo;
  }
  
}
