export interface PrenotazioneInput {
	numero_persone: number;
	data_ora_prenotazione: string;
	ref_cliente: number | null;
}

export interface PrenotazioneInputLoco extends PrenotazioneInput {
	otp: string | null;
	ref_torretta: number | null;
}

export interface PrenotazioneRecord extends PrenotazioneInputLoco {
	id_prenotazione: number;
}
