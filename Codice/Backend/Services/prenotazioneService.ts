import Prenotazione, { PrenotazioneInput, PrenotazioneRecord } from "../Models/prenotazione";
import Torretta, { TorrettaRecord } from "../Models/torretta";

export interface PrenotazioneRequest {
	numero_persone: number;
	data_ora_prenotazione: string;
	ref_cliente: number;
	ref_filiale: number;
}

class PrenotazioneService {
    static generateOTP(): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let otp = '';
        for (let i = 0; i < 6; i++) {
            const index = Math.floor(Math.random() * characters.length);
            otp += characters[index];
        }
        return otp;
    }

    static async prenota(data: PrenotazioneRequest): Promise<number> {
        try {
            // Recupera torrette libere alla data e filiale specificate
            const torretteLibere = await Torretta.getTorretteLibere(
                data.ref_filiale,
                data.data_ora_prenotazione
            );

            const torrettaSelezionata = torretteLibere.length > 0 ? torretteLibere[0].id_torretta : null;

            if (!torrettaSelezionata) {
                throw new Error('Nessuna torretta disponibile per questa data/ora');
            }

            const input: PrenotazioneInput = {
                numero_persone: data.numero_persone,
                data_ora_prenotazione: data.data_ora_prenotazione,
                ref_cliente: data.ref_cliente || null,
                ref_torretta: torrettaSelezionata
            };

            return await Prenotazione.create(input);
        } catch (error) {
            console.error('❌ [PrenotazioneService] Errore durante la prenotazione:', error);
            throw error;
        }
    }

    static async confermaPrenotazione(id_prenotazione: number): Promise<void> {
        try {
            let otp = this.generateOTP();
            await Prenotazione.confermaPrenotazione(id_prenotazione, otp);
        } catch (error) {
            console.error('❌ [PrenotazioneService] Errore durante la conferma della prenotazione:', error);
            throw error;
        }
    }

    static async prenotaLoco(data: PrenotazioneInput): Promise<number> {
        try {
            const otp = this.generateOTP();
            return await Prenotazione.createLocale(data, otp);
        } catch (error) {
            console.error('❌ [PrenotazioneService] Errore durante la prenotazione locale:', error);
            throw error;
        }
    }

    static async modificaPrenotazione(id_prenotazione: number, numero_persone: number, data_ora_prenotazione: string): Promise<void> {
        try {
            return await Prenotazione.update(id_prenotazione, numero_persone, data_ora_prenotazione);
        } catch (error) {
            console.error('❌ [PrenotazioneService] Errore durante la modifica della prenotazione:', error);
            throw error;
        }
    }

    static async eliminaPrenotazione(id: number): Promise<void> {
        try {
            return await Prenotazione.delete(id);
        } catch (error) {
            console.error('❌ [PrenotazioneService] Errore durante l\'eliminazione della prenotazione:', error);
            throw error;
        }
    }

    static async getOTPById(id: number): Promise<string | null> {
        try {
            const prenotazione = await Prenotazione.getById(id);
            if (prenotazione) {
                return prenotazione.otp || null;
            }
            return null;
        } catch (error) {
            console.error('❌ [PrenotazioneService] Errore durante il recupero dell\'OTP:', error);
            throw error;
        }
    }

    static async getPrenotazioneById(id: number): Promise<PrenotazioneRecord | null> {
        try {
            return await Prenotazione.getById(id);
        } catch (error) {
            console.error('❌ [PrenotazioneService] Errore durante il recupero della prenotazione:', error);
            throw error;
        }
    }

    static async getAllPrenotazioni(): Promise<PrenotazioneRecord[] | null> {
        try {
            return await Prenotazione.getAll();
        } catch (error) {
            console.error('❌ [PrenotazioneService] Errore durante il recupero delle prenotazioni:', error);
            throw error;
        }
    }

    static async getPrenotazioniByCliente(clienteId: number): Promise<PrenotazioneRecord[] | null> {
        try {
            return await Prenotazione.getByCliente(clienteId);
        } catch (error) {
            console.error('❌ [PrenotazioneService] Errore durante il recupero delle prenotazioni per cliente:', error);
            throw error;
        }
    }

    static async getPrenotazioniDelGiornoFiliale(id_filiale: number): Promise<PrenotazioneRecord[] | null> {
        try {
            return await Prenotazione.getPrenotazioniDelGiornoFiliale(id_filiale);
        } catch (error) {
            console.error('❌ [PrenotazioneService] Errore durante il recupero delle prenotazioni per data:', error);
            throw error;
        }
    }

    static calcolaTavoliRichiesti(numeroPersone: number): number {
	    if (numeroPersone <= 0) return 0;
	    return Math.ceil((numeroPersone - 2) / 2);
    }

    static async calcolaTavoliInUso(): Promise<Record<string, number>> {
		const prenotazioni = await Prenotazione.getPrenotazioniAttualiEFuture();
		const tavoliPerOrario: Record<string, number> = {};

		for (const p of prenotazioni) {
			const timestamp = p.data_ora_prenotazione;
			const tavoli = this.calcolaTavoliRichiesti(p.numero_persone);

			if (!tavoliPerOrario[timestamp]) {
				tavoliPerOrario[timestamp] = 0;
			}
			tavoliPerOrario[timestamp] += tavoli;
		}

		return tavoliPerOrario;
	}
}

export default PrenotazioneService;