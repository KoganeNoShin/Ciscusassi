import AspProd from "../Models/asp_prod";

class AspProdService {
    static async addAspProd(ref_asporto: number, ref_prodotto: number): Promise<number> {
        return await AspProd.create({ ref_asporto, ref_prodotto });
    }
}

export default AspProdService;