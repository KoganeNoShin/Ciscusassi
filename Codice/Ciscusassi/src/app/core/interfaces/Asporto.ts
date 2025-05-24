export interface AsportoInput {
	indirizzo: string;
	data_ora_consegna: string;
	ref_cliente: number;
	ref_pagamento: number;
}

export interface AsportoRecord extends AsportoInput {
	id_asporto: number;
}