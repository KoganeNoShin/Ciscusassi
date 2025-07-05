import { Injectable } from '@angular/core';
import { FilialeRecord } from 'src/app/core/interfaces/Filiale';

@Injectable({
  providedIn: 'root',
})
export class FilialeAsportoService {
  private _closestFiliale: FilialeRecord | null = null;
  private _travelTimeMinutes: number | null = null;
  private _indirizzoSelezionato: string = '';

  /**
	 * Imposta la filiale più vicina, il tempo di viaggio stimato e l'indirizzo dell'utente.
	 *
	 * @remarks
	 * Questa funzione permette di impostare la filiale più vicina, il tempo di viaggio e l'indirizzo dell'utente, andando a popolare
   * le proprietà private della classe.
	 */
  setFiliale(
    filiale: FilialeRecord | null,
    travelTime: number | null,
    indirizzoUtente: string = ''
  ): void {
    this._closestFiliale = filiale;
    this._travelTimeMinutes = travelTime;
    this._indirizzoSelezionato = indirizzoUtente;
  }

  /**
   * Restituisce la filiale più vicina.
   */
  get closestFiliale(): FilialeRecord | null {
    return this._closestFiliale;
  }

  /**
   * Restituisce il tempo di viaggio stimato (in minuti)
   */
  get travelTimeMinutes(): number | null {
    return this._travelTimeMinutes;
  }

  /**
   * Restituisce l'indirizzo dell'utente selezionato
   */
  get indirizzoUtente(): string {
    return this._indirizzoSelezionato;
  }

  /**
   * Svuota le informazioni sulla filiale più vicina, il tempo di viaggio e l'indirizzo dell'utente.
   */
  clear(): void {
    this._closestFiliale = null;
    this._travelTimeMinutes = null;
    this._indirizzoSelezionato = '';
  }
}
