import OrdProd, {OrdProdInput, OrdProdRecord } from "../Models/ord_prod";
import Ordine from "../Models/ordine";
import Prodotto, { ProdottoInput } from "../Models/prodotto";

interface OrdProdEstended extends ProdottoInput {
    id_ord_prod: number;
    is_romana: boolean;
    stato: string;
}

class OrdProdService {
    static async creaOrdiniProdotto(ordini: OrdProdInput[]): Promise<number[]> {
        const idsInseriti: number[] = [];

        for (const ordine of ordini) {
            try {
                const id = await OrdProd.create(ordine);
                idsInseriti.push(id);
            } catch (err) {
                console.error('❌ [SERVICE ERROR] Errore durante la creazione di un OrdProd:', err);
                throw err; // se preferisci continuare anche in caso di errore, rimuovi questa riga
            }
        }

        return idsInseriti;
    }

    static async getProdottiByPrenotazione(prenotazioneId: number): Promise<OrdProdEstended[] | null> {
        try {
            const ordini = await Ordine.getByPrenotazione(prenotazioneId);
            if (!ordini || ordini.length === 0) {
                return null;
            }

            const prodotti = await Promise.all(
                ordini.map(async (ordine) => {
                    return await this.getProdottiByOrdine(ordine.id_ordine);
                })
            );

            return prodotti.flat().filter(p => p !== null) as OrdProdEstended[];
        } catch (error) {
            console.error('❌ [OrdProdService] Errore durante il recupero dei prodotti per la prenotazione:', error);
            throw error;
        }
    }
    

    static async getProdottiByOrdine(ordineId: number): Promise<OrdProdEstended[] | null> {
        try {
            const ord_prod = await OrdProd.getByOrdine(ordineId);
            if (!ord_prod || ord_prod.length === 0) {
                return null;
            }

            const prodotti = await Promise.all(
                ord_prod.map(async (op) => {
                    const prodotto = await Prodotto.getByID(op.ref_prodotto);
                    if (!prodotto) {
                        throw new Error(`Prodotto con ID ${op.ref_prodotto} non trovato`);
                    }
                    return {
                        ...prodotto,
                        id_ord_prod: op.id_ord_prod,
                        is_romana: op.is_romana,
                        stato: op.stato
                    } as OrdProdEstended;
                })
            );
            return prodotti;
        } catch (error) {
            console.error('❌ [OrdProdService] Errore durante il recupero dei prodotti dell\'ordine:', error);
            throw error;
        }
    }

    static async cambiaStatoProdottoOrdine(idProdotto: number, stato: string): Promise<void> {
        try {
            await OrdProd.cambiaStato(idProdotto, stato);
        } catch (error) {
            console.error('❌ [OrdProdService] Errore durante il cambio di stato del prodotto dell\'ordine:', error);
            throw error;
        }
    }

    static async aggiornaStatoRomana(idOrdProd: number, isRomana: boolean): Promise<void> {
        try {
            await OrdProd.aggiornaStatoRomana(idOrdProd, isRomana);
        } catch (error) {
            throw new Error(`Errore durante l'aggiornamento dello stato di romane: ${error}`);
        }
    }
}

export default OrdProdService;