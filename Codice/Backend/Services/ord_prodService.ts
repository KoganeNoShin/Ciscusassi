import OrdProd, { OrdProdInput, OrdProdRecord } from "../Models/ord_prod";


class Ord_prod{
    static async getAll(): Promise<OrdProdRecord[]> {
        const ord_prod = await OrdProd.findAll();
        return ord_prod || [];
    }

    static async getById(id: number): Promise<OrdProdRecord | null> {
        const ord_prod = await OrdProd.findById(id);
        return ord_prod || null;
    }

    static async getByRefOrdine(ref_ordine: number): Promise<OrdProdRecord[]> {
        const ord_prod = await OrdProd.findByRefOrdine(ref_ordine);
        return ord_prod || [];
    }
    
    static async addOrdProd(ref_ordine: number, ref_prodotto: number): Promise<number> {
        return await OrdProd.addProdotto(ref_ordine, ref_prodotto);
    }

    static async deleteOrdProd(id: number): Promise<void> {
        return await OrdProd.removeProdotto(id);
    }

    static async cambiaRomana(id: number): Promise<void> {
        return await OrdProd.cambiaRomana(id);
    }

    static async cambioStato(id: number, stato: string): Promise<void> {
        return await OrdProd.modificaStato(id, stato);
    }
}

export default Ord_prod;