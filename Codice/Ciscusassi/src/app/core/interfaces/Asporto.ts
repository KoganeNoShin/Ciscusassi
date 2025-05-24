export interface AsportoInput {
	indirizzo: string;
	data_ora_consegna: string;
	ref_cliente: number;
	importo: number;
	data_ora_pagamento: string;
}

export interface AsportoRecord extends AsportoInput {
	id_asporto: number;
}