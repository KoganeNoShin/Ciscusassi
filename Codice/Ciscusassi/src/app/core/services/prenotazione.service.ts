import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PrenotazioneService {
  filialeId: number = 0;
  numeroPosti: number = 0;
  dataPrenotazione: string = '';
  oraPrenotazione: string = '';

  constructor() { }

  setFilialeId(id: number): void {
    this.filialeId = id;
  }
  setNumeroPosti(numero: number): void {
    this.numeroPosti = numero;
  }
  setDataPrenotazione(data: string): void {
    this.dataPrenotazione = data;
  }
  setOraPrenotazione(ora: string): void {
    this.oraPrenotazione = ora;
  }
  getFilialeId(): number {
    return this.filialeId;
  }
  getNumeroPosti(): number {
    return this.numeroPosti;
  }
  getDataPrenotazione(): string {
    return this.dataPrenotazione;
  }
  getOraPrenotazione(): string {
    return this.oraPrenotazione;
  }
}
