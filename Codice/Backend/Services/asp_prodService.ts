import AspProd, { AspProdInput } from "../Models/asp_prod";
import Asporto from "../Models/asporto";
import Prodotto from "../Models/prodotto";

class AspProdService {
    private static async validate(input: AspProdInput): Promise<void> {
        const asporto = await Asporto.getByID(input.ref_asporto);
        if(!asporto) {
            throw new Error(`Asporto con ID ${input.ref_asporto} non esiste.`);
        }

        const prodotto = await Prodotto.getByID(input.ref_prodotto);
        if(!prodotto) {
            throw new Error(`Prodotto con ID ${input.ref_prodotto} non esiste.`);
        }
    }


    static async addAspProd(ref_asporto: number, ref_prodotto: number): Promise<number> {
        await this.validate({ref_asporto, ref_prodotto})
        return await AspProd.create({ ref_asporto, ref_prodotto });
    }
}

export default AspProdService;