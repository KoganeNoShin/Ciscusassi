import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TavoloService {
  constructor() { }

  numeroTorretta: number = -1;

  setnumeroTorretta(numeroTorretta: number){
    this.numeroTorretta = numeroTorretta;
  }

  getnumeroTorretta() : number{
    return this.numeroTorretta;
  }
}
