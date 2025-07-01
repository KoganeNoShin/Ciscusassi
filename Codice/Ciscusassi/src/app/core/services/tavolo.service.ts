import { Injectable } from '@angular/core';
import { OrdProdEstended } from '../interfaces/OrdProd';

export interface Tavolo {
	numero: number;
	prenotazione: number;
	orario: string;
	persone: number;
	stato: string;
}

@Injectable({
	providedIn: 'root',
})
export class TavoloService {
	tavolo: Tavolo | null = {
		numero: null as any,
		prenotazione: null as any,
		orario: null as any,
		persone: null as any,
		stato: null as any,
	};

	prodotti: OrdProdEstended[] = [];
	numeroOrdine: number | null = null;
	totale: number = 0;
	haOrdinato: boolean = false;
	totaleQuery: number = 0;
	haPagato: number | null = null;

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
		if (this.tavolo) {
			return this.tavolo.numero;
		}
		return null;
	}

	getPrenotazione(): number | null {
		if (this.tavolo) {
			return this.tavolo.prenotazione;
		}
		return null;
	}

	setTavolo(tavolo: Tavolo) {
		this.tavolo = tavolo;
	}

	setHaPagato(haPagato: number | null){
		this.haPagato = haPagato;
	}

	getHaPagato(): number | null{
		return this.haPagato;
	}
	
	getTavolo(): Tavolo | null {
		return this.tavolo;
	}

	setHaOrdinato(HaOrdinato: boolean) {
		this.haOrdinato = HaOrdinato;
	}

	getHaOrdinato(): boolean {
		return this.haOrdinato;
	}

	setNumeroOrdine(numeroOrdine: number) {
		this.numeroOrdine = numeroOrdine;
	}

	getNumeroOrdine(): number | null {
		return this.numeroOrdine;
	}

	svuotaTavolo() {
		this.tavolo = {
			numero: null as any,
			prenotazione: null as any,
			orario: null as any,
			persone: null as any,
			stato: null as any,
		};
		this.setHaOrdinato(false);
		this.setNumeroOrdine(0);
		this.setNumeroTavolo(0);
		this.setOrdini([]);
		this.setTotaleQuery(0);
		this.setPrenotazione(0);
	}

	setOrdini(prodotti: OrdProdEstended[]) {
    	this.totale = 0;
		this.prodotti = prodotti;
		for (let prodotto of this.prodotti) {
			this.totale = this.totale + prodotto.costo;
		}
	}

	setTotaleQuery(totaleQuery: number){
		this.totaleQuery = totaleQuery;
	}

	getTotaleQuery(): number{
		return this.totaleQuery;
	}

	getOrdini(): OrdProdEstended[] {
		return this.prodotti;
	}

	getTotale(): number {
		return this.totale;
	}
}
