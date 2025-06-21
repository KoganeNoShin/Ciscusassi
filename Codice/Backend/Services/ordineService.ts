import Ordine, { OrdineInput, OrdineRecord } from "../Models/ordine";

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

    static async modificaOrdine(data: OrdineRecord): Promise<void> {
        try {
            return await Ordine.updateOrdine(data);
        } catch (error) {
            console.error('❌ [OrdineService] Errore durante la modifica dell\'ordine:', error);
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
}

export default OrdineService;