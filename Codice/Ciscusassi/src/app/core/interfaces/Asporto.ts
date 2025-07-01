export interface AsportoInput {
	indirizzo: string,
    data_ora_consegna: string,
    ref_filiale: number,
    importo: number,
    data_ora_pagamento: string,
    prodotti: number[]
}

export interface AsportoRecord extends AsportoInput {
	id_asporto: number;
    ref_cliente: number;
}