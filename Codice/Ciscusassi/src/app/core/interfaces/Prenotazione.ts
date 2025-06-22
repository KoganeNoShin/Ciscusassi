export interface PrenotazioneInput {
	numero_persone: number;
	data_ora_prenotazione: string;
	ref_cliente: number | null;
	ref_torretta: number;
}

export interface PrenotazioneRecord extends PrenotazioneInput {
	id_prenotazione: number;
	otp: string | null;
}

export interface PrenotazioneRequest {
	numero_persone: number;
	data_ora_prenotazione: string;
	ref_cliente: number;
	ref_filiale: number;
}
