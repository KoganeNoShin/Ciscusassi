import Ordine, { OrdineInput, OrdineRecord } from "../Models/ordine";
import Prenotazione from "../Models/prenotazione";
import OrdProd from "../Models/ord_prod";
import Prodotto from "../Models/prodotto";
import Cliente from "../Models/cliente";
import Pagamento, { PagamentoInput } from "../Models/pagamento";

class OrdineService {
    static async creaOrdine(data: OrdineInput): Promise<number> {
        try {
            if (data.ref_cliente != null) {
                const cliente = await Cliente.getByNumeroCarta(data.ref_cliente);

                if (!cliente) {
                    throw new Error('Cliente non trovato');
                }

                const [nome, cognome, anno] = data.username_ordinante.split('.');
                const annoNascitaCliente = cliente.data_nascita.split('-')[0];

                const nomeMatch = cliente.nome.toLowerCase() === nome.toLowerCase();
                const cognomeMatch = cliente.cognome.toLowerCase() === cognome.toLowerCase();
                const annoMatch = annoNascitaCliente === anno;

                if (!(nomeMatch && cognomeMatch && annoMatch)) {
                    throw new Error('Username non corrisponde ai dati del cliente');
                }
            }

            const ordineEsistente = await Ordine.getIDOrdineByPrenotazioneAndUsername(data.ref_prenotazione, data.username_ordinante);

            if(ordineEsistente){
                throw new Error('Esiste già un ordine con questo username per la stessa prenotazione');
            }
            
            return await Ordine.create(data);
        } catch (error) {
            console.error('❌ [OrdineService] Errore durante la creazione dell\'ordine:', error);
            throw error;
        }
    }

    static async aggiungiPagamento(importo: number, data_ora_pagamento: string, id_ordine: number): Promise<void> {
        try {
            const pagamentoData = {importo, data_ora_pagamento} as PagamentoInput;
            const id_pagamento = await Pagamento.create(pagamentoData);
            if(!id_pagamento) {
                throw new Error("Creazione del pagamento fallita.");
            }
            return await Ordine.addPagamento(id_pagamento, id_ordine);
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

    static async getIDOrdineByPrenotazioneAndUsername(prenotazioneID: number, username: string): Promise<number | null> {
        try {
            return await Ordine.getIDOrdineByPrenotazioneAndUsername(prenotazioneID, username);
        }catch (error) {
            console.error('❌ [OrdineService] Errore durante il recupero dell\'ordine per prenotazione ed Username:', error);
            throw error;
        }
    }

    static async calcolaImportoTotale(ordineId: number): Promise<number> {
        // Recupero Ordine
        const ordine = await Ordine.getById(ordineId);
        if(ordine == null) {
            throw new Error(`Ordine con ID ${ordineId} non trovato`);
        }
        // Recupero prenotazione associata
        const prenotazione = await Prenotazione.getById(ordine.ref_prenotazione);
        if (!prenotazione) {
            throw new Error(`Prenotazione con ID ${ordine.ref_prenotazione} non trovata per ordine`);
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

        totaleRomana = totaleRomana / prenotazione.numero_persone;
        const totale = totaleNotRomana + totaleRomana;
        return Math.round(totale * 100) / 100;
    }
}

export default OrdineService;