import { ProdottoInput } from "./Prodotto";

interface OrdProdEstended extends ProdottoInput {
    id_ord_prod: number;
    is_romana: boolean;
    stato: string;
}