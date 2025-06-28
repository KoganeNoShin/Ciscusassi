import { Injectable } from '@angular/core';

export interface Tavolo {
  numero: number;
  prenotazione: number;
  orario: string;
  persone: number;
  stato: string;
}

@Injectable({
  providedIn: 'root'
})
export class TavoloService {
  tavolo: Tavolo | null = {
    numero: null as any,
    prenotazione: null as any,
    orario: null as any,
    persone: null as any,
    stato: null as any
  };

  setNumeroTavolo(numero: number): void {
    if (this.tavolo) {
      this.tavolo.numero = numero;
    }
  }

  setPrenotazione(prenotazione: number): void {
    if (this.tavolo) {
      this.tavolo.prenotazione = prenotazione;
    }
  }
  getNumeroTavolo(): number | null {
    return this.tavolo ? this.tavolo.numero : null;
  }

  getPrenotazione(): number | null{
    return this.tavolo ? this.tavolo.prenotazione: null;
  }

  setTavolo(tavolo: Tavolo){
	this.tavolo = tavolo;
  }

  getTavolo(): Tavolo | null{
    return this.tavolo;
  }
  
}
