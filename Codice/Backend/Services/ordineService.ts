import { th } from "@faker-js/faker/.";
import Ordine, { OrdineInput, OrdineRecord } from "../Models/ordine";
import Prenotazione from "../Models/prenotazione";
import OrdProd from "../Models/ord_prod";
import Prodotto from "../Models/prodotto";

class OrdineService {
    static async creaOrdine(data: OrdineInput): Promise<number> {
        try {
            return await Ordine.create(data);
        } catch (error) {
            console.error('❌ [OrdineService] Errore durante la creazione dell\'ordine:', error);
            throw error;
        }
    }

    static async aggiungiPagamento(ref_pagamento: number, id_ordine: number): Promise<void> {
        try {
            return await Ordine.addPagamento(ref_pagamento, id_ordine);
        } catch (error) {
            console.error('❌ [OrdineService] Errore durante l\'aggiunta del pagamento all\'ordine:', error);
            throw error;
        }
    }

    static async eliminaOrdine(id: number): Promise<void> {
        try {
            return await Ordine.deleteOrdine(id);
        } catch (error) {
            console.error('❌ [OrdineService] Errore durante l\'eliminazione dell\'ordine:', error);
            throw error;
        }
    }

    static async getOrdineById(id: number): Promise<OrdineRecord | null> {
        try {
            return await Ordine.getById(id);
        } catch (error) {
            console.error('❌ [OrdineService] Errore durante il recupero dell\'ordine:', error);
            throw error;
        }
    }

    static async getAllOrdini(): Promise<OrdineRecord[]> {
        try {
            return await Ordine.getAll();
        } catch (error) {
            console.error('❌ [OrdineService] Errore durante il recupero degli ordini:', error);
            throw error;
        }
    }

    static async getOrdiniByCliente(clienteId: number): Promise<OrdineRecord[] | null> {
        try {
            return await Ordine.getByCliente(clienteId);
        } catch (error) {
            console.error('❌ [OrdineService] Errore durante il recupero degli ordini per cliente:', error);
            throw error;
        }
    }

    static async getOrdiniByPrenotazione(prenotazioneId: number): Promise<OrdineRecord[] | null> {
        try {
            return await Ordine.getByPrenotazione(prenotazioneId);
        } catch (error) {
            console.error('❌ [OrdineService] Errore durante il recupero degli ordini per prenotazione:', error);
            throw error;
        }
    }

    static async calcolaImportoTotale(ordineId: number): Promise<number> {
        // Recupero Ordine
        const ordine = await this.getOrdineById(ordineId);
        if(!ordine) {
            throw new Error(`Ordine con ID ${ordineId} non trovato`);
        }
        // Recupero prenotazione associata
        const prenotazione = await Prenotazione.getById(ordine.ref_prenotazione);
        if (!prenotazione) {
            throw new Error(`Prenotazione con ID ${ordine.ref_prenotazione} non trovata`);
        }
        // Prodotti non alla romana dell'ordine
        const prodottiNotRomana = await OrdProd.getByOrdineAndRomana(ordineId, false);
        let totaleNotRomana = 0;
        if (prodottiNotRomana != null && prodottiNotRomana.length !== 0) {
            for(const prod_asp of prodottiNotRomana) {
                const prodotto = await Prodotto.getByID(prod_asp.ref_prodotto);
                if(!prodotto) {
                    throw new Error(`Prodotto con ID ${prod_asp.ref_prodotto} non trovato`);
                }
                totaleNotRomana += prodotto.costo;
            }
        }

        // Prodotti alla romana dell'ordine
        const prodottiRomana = await OrdProd.getByOrdineAndRomana(ordineId, true);
        let totaleRomana = 0;
        if (prodottiRomana != null && prodottiRomana.length !== 0) {
            for(const prod_asp of prodottiRomana) {
                const prodotto = await Prodotto.getByID(prod_asp.ref_prodotto);
                if(!prodotto) {
                    throw new Error(`Prodotto con ID ${prod_asp.ref_prodotto} non trovato`);
                }
                totaleRomana += prodotto.costo;
            }
        }

        totaleRomana = totaleNotRomana / prenotazione.numero_persone;
        const totale = totaleNotRomana + totaleRomana;
        return Math.round(totale * 100) / 100;
    }
}

export default OrdineService;