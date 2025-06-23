import OrdProd from '../Models/ord_prod';
import Ordine from '../Models/ordine';
import Prenotazione, {
	PrenotazioneInput,
	PrenotazioneRecord,
} from '../Models/prenotazione';
import Torretta from '../Models/torretta';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export interface PrenotazioneRequest {
	numero_persone: number;
	data_ora_prenotazione: string;
	ref_cliente: number | null;
	ref_filiale: number;
}

class PrenotazioneService {
	static generateOTP(): string {
		const characters =
			'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		let otp = '';
		for (let i = 0; i < 6; i++) {
			const index = Math.floor(Math.random() * characters.length);
			otp += characters[index];
		}
		return otp;
	}

	static calcolaTavoliRichiesti(numeroPersone: number): number {
		if (numeroPersone <= 0) return 0;
		return Math.ceil((numeroPersone - 2) / 2);
	}

	static dataToFormattedString(data: string): string {
		if (!data) return '';
		const parsedDate = new Date(data);
		if (isNaN(parsedDate.getTime())) {
			throw new Error('Formato data non valido ' + data);
		}
		const dataFormattata = format(parsedDate, 'yyyy-MM-dd HH:mm:ss', {
			locale: it,
		});
		return dataFormattata;
	}

	static async prenota(data: PrenotazioneRequest): Promise<number> {
		try {
			// Recupera torrette libere alla data e filiale specificate
			const torretteLibere = await Torretta.getTorretteLibere(
				data.ref_filiale,
				data.data_ora_prenotazione
			);

			const torrettaSelezionata =
				torretteLibere.length > 0
					? torretteLibere[0].id_torretta
					: null;

			if (!torrettaSelezionata) {
				throw new Error(
					'Nessuna torretta disponibile per questa data/ora'
				);
			}
			let dataFormattata = '';
			if (data.data_ora_prenotazione) {
				dataFormattata = this.dataToFormattedString(
					data.data_ora_prenotazione
				);
			}

			const input: PrenotazioneInput = {
				numero_persone: data.numero_persone,
				data_ora_prenotazione: dataFormattata,
				ref_cliente: data.ref_cliente,
				ref_torretta: torrettaSelezionata,
			};

			return await Prenotazione.create(input);
		} catch (error) {
			console.error(
				'❌ [PrenotazioneService] Errore durante la prenotazione:',
				error
			);
			throw error;
		}
	}

	static async prenotaLoco(data: PrenotazioneRequest): Promise<number> {
		try {
			// Recupera torrette libere alla data e filiale specificate
			const torretteLibere = await Torretta.getTorretteLibere(
				data.ref_filiale,
				data.data_ora_prenotazione
			);

			const torrettaSelezionata =
				torretteLibere.length > 0
					? torretteLibere[0].id_torretta
					: null;

			if (!torrettaSelezionata) {
				throw new Error(
					'Nessuna torretta disponibile per questa data/ora'
				);
			}

			let dataFormattata = '';
			if (data.data_ora_prenotazione) {
				dataFormattata = this.dataToFormattedString(
					data.data_ora_prenotazione
				);
			}

			const input: PrenotazioneInput = {
				numero_persone: data.numero_persone,
				data_ora_prenotazione: dataFormattata,
				ref_cliente: data.ref_cliente,
				ref_torretta: torrettaSelezionata,
			};

			const otp = this.generateOTP();
			return await Prenotazione.createLocale(input, otp);
		} catch (error) {
			console.error(
				'❌ [PrenotazioneService] Errore durante la prenotazione locale:',
				error
			);
			throw error;
		}
	}

	static async confermaPrenotazione(id_prenotazione: number): Promise<void> {
		try {
			let otp = this.generateOTP();
			await Prenotazione.confermaPrenotazione(id_prenotazione, otp);
		} catch (error) {
			console.error(
				'❌ [PrenotazioneService] Errore durante la conferma della prenotazione:',
				error
			);
			throw error;
		}
	}

	static async modificaPrenotazione(
		id_prenotazione: number,
		numero_persone: number,
		data_ora_prenotazione: string
	): Promise<void> {
		try {
			let dataFormattata = '';
			if (data_ora_prenotazione) {
				dataFormattata = this.dataToFormattedString(
					data_ora_prenotazione
				);
			}
			return await Prenotazione.update(
				id_prenotazione,
				numero_persone,
				dataFormattata
			);
		} catch (error) {
			console.error(
				'❌ [PrenotazioneService] Errore durante la modifica della prenotazione:',
				error
			);
			throw error;
		}
	}

	static async eliminaPrenotazione(id: number): Promise<void> {
		try {
			return await Prenotazione.delete(id);
		} catch (error) {
			console.error(
				"❌ [PrenotazioneService] Errore durante l'eliminazione della prenotazione:",
				error
			);
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
			console.error(
				"❌ [PrenotazioneService] Errore durante il recupero dell'OTP:",
				error
			);
			throw error;
		}
	}

	static async getPrenotazioneById(
		id: number
	): Promise<PrenotazioneRecord | null> {
		try {
			return await Prenotazione.getById(id);
		} catch (error) {
			console.error(
				'❌ [PrenotazioneService] Errore durante il recupero della prenotazione:',
				error
			);
			throw error;
		}
	}

	static async getAllPrenotazioni(): Promise<PrenotazioneRecord[] | null> {
		try {
			return await Prenotazione.getAll();
		} catch (error) {
			console.error(
				'❌ [PrenotazioneService] Errore durante il recupero delle prenotazioni:',
				error
			);
			throw error;
		}
	}

	static async getPrenotazioniByCliente(
		clienteId: number
	): Promise<PrenotazioneRecord[] | null> {
		try {
			return await Prenotazione.getByCliente(clienteId);
		} catch (error) {
			console.error(
				'❌ [PrenotazioneService] Errore durante il recupero delle prenotazioni per cliente:',
				error
			);
			throw error;
		}
	}

	static async getPrenotazioniDataAndFiliale(
		id_filiale: number,
		data: string
	): Promise<PrenotazioneRecord[] | null> {
		try {
			const dataFormattata = format(new Date(data), 'yyyy-MM-dd', {
				locale: it,
			});
			return await Prenotazione.getPrenotazioniDataAndFiliale(
				id_filiale,
				dataFormattata
			);
		} catch (error) {
			console.error(
				'❌ [PrenotazioneService] Errore durante il recupero delle prenotazioni per data:',
				error
			);
			throw error;
		}
	}

	static async calcolaTavoliInUso(
		id_filiale: number,
		data: string
	): Promise<Record<string, number>> {
		const orariValidi = ['12:00:00', '13:30:00', '19:30:00', '21:00:00'];
		const tavoliPerOrario: Record<string, number> = {};
		const dataFormattata = format(new Date(data), 'yyyy-MM-dd', {
			locale: it,
		});

		for (const orario of orariValidi) {
			const timestamp = `${dataFormattata} ${orario}`;
			const prenotazioni =
				await Prenotazione.getPrenotazioniDataAndFiliale(
					id_filiale,
					dataFormattata
				);
			tavoliPerOrario[timestamp] = 0;
			for (const p of prenotazioni) {
				const tavoli = this.calcolaTavoliRichiesti(p.numero_persone);

				tavoliPerOrario[timestamp] += tavoli;
			}
		}

		return tavoliPerOrario;
	}

	static async getStatoPrenotazione(
		id_prenotazione: number
	): Promise<string> {
		try {
			const otp = await Prenotazione.getOTPById(id_prenotazione);
			if (!otp) {
				return 'attesa-arrivo';
			}
			const ordini = await Ordine.getByPrenotazione(id_prenotazione);

			if (!ordini || ordini.length === 0) {
				return 'senza-ordini';
			}

			for (const ordine of ordini) {
				const prodotti = await OrdProd.getByOrdine(ordine.id_ordine);

				if (prodotti == null || prodotti.length === 0) continue;

				let hasPreparazione = false;
				let hasInConsegna = false;
				let allConsegnati = true;

			for (const p of prodotti) {
				if (p.stato === 'in-consegna') hasInConsegna = true;
				else if (p.stato === 'in-lavorazione') hasPreparazione = true;
				else if (p.stato !== 'consegnato') allConsegnati = false;

					// Early exit per priorità
					if (hasInConsegna) return 'in-consegna';
				}

			if (hasPreparazione) return 'in-lavorazione';
			if (allConsegnati) return 'consegnato';
		}

			return 'non-in-lavorazione';
		} catch (err) {
			console.error(
				`❌ Errore nel recuperare lo stato della prenotazione ${id_prenotazione}:`,
				err
			);
			throw err;
		}
	}
}

export default PrenotazioneService;
