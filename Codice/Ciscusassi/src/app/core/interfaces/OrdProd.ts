import { ProdottoInput, ProdottoRecord } from "./Prodotto";

export interface OrdProdEstended extends ProdottoRecord {
    id_ord_prod: number;
    is_romana: boolean;
    stato: string;
}

export interface OrdProdInput {
	is_romana: boolean;
	stato: string;
	ref_prodotto: number;
	ref_ordine: number;
}