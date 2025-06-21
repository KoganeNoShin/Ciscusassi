import Prenotazione, { PrenotazioneInput, PrenotazioneInputLoco, PrenotazioneRecord } from "../Models/prenotazione";

class PrenotazioneService {
    static async prenota(data: PrenotazioneInput): Promise<number> {
        try {
            return await Prenotazione.create(data);
        } catch (error) {
            console.error('❌ [PrenotazioneService] Errore durante la prenotazione:', error);
            throw error;
        }
    }

    static async prenotaLoco(data: PrenotazioneInputLoco): Promise<number> {
        try {
            return await Prenotazione.createLocale(data);
        } catch (error) {
            console.error('❌ [PrenotazioneService] Errore durante la prenotazione locale:', error);
            throw error;
        }
    }

    static async modificaPrenotazione(data: PrenotazioneRecord): Promise<void> {
        try {
            return await Prenotazione.update(data);
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

    static async getPrenotazioniDelGiorno(): Promise<PrenotazioneRecord[] | null> {
        try {
            return await Prenotazione.getPrenotazioniDelGiorno();
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