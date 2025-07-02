import Filiale from '../Models/filiale';
import OrdProd from '../Models/ord_prod';
import Ordine from '../Models/ordine';
import Prenotazione, {
	PrenotazioneInput,
	PrenotazioneRecord,
} from '../Models/prenotazione';
import Torretta from '../Models/torretta';

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
		let numeroTavoliRichiesti = 0;
		for (let t = 2; t <= numeroPersone; t++) {
        	const postiDisponibili = 2 * t + 2;
			if (postiDisponibili >= numeroPersone) {
				numeroTavoliRichiesti = t;
				break;
			}
      	}
		return numeroTavoliRichiesti;
	}

	static async prenota(data: PrenotazioneRequest): Promise<number> {
		try {
			// Check Orario
			const orariValidi = ['12:00', '13:30', '19:30', '21:00'];
			const dataPrenotazione = new Date(data.data_ora_prenotazione);
			const adesso = new Date();

			const ore = dataPrenotazione.getHours().toString().padStart(2, '0');
            const minuti = dataPrenotazione.getMinutes().toString().padStart(2, '0');
            const orarioPrenotato = `${ore}:${minuti}`;

            if (!orariValidi.includes(orarioPrenotato)) {
                throw new Error(`L'orario selezionato (${orarioPrenotato}) non è valido. Orari disponibili: ${orariValidi.join(', ')}`);
            }

			if(dataPrenotazione < adesso){
                throw new Error('La data e ora della prenotazione non può essere nel passato');
            }

			// Check posto
			const filiale = await Filiale.getById(Number(data.ref_filiale));
			if (!filiale) throw new Error('Filiale non trovata');
			
			const tavoliTotali = filiale.num_tavoli;
			const tavoliInUso = await this.calcolaTavoliInUso(filiale.id_filiale, data.data_ora_prenotazione);
			const tavoliOccupati = tavoliInUso[data.data_ora_prenotazione] ?? 0;
			
			const tavoliRichiesti = PrenotazioneService.calcolaTavoliRichiesti(data.numero_persone);
			
			if (tavoliOccupati + tavoliRichiesti > tavoliTotali) {
					const disponibili = tavoliTotali - tavoliOccupati;
					throw new Error(`Non ci sono abbastanza tavoli disponibili in quell'orario. Tavoli disponibili: ${disponibili}`);
			}
			
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

			const input: PrenotazioneInput = {
				numero_persone: data.numero_persone,
				data_ora_prenotazione: data.data_ora_prenotazione,
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
			// Check Orario
			const orariValidi = ['12:00', '13:30', '19:30', '21:00'];
			const dataPrenotazione = new Date(data.data_ora_prenotazione);
			const adesso = new Date();
			const minutiOffset = 10;

			const ore = dataPrenotazione.getHours().toString().padStart(2, '0');
            const minuti = dataPrenotazione.getMinutes().toString().padStart(2, '0');
            const orarioPrenotato = `${ore}:${minuti}`;
			
            if (!orariValidi.includes(orarioPrenotato)) {
                throw new Error(`L'orario selezionato (${orarioPrenotato}) non è valido. Orari disponibili: ${orariValidi.join(', ')}`);
            }

			if (dataPrenotazione < adesso) {
				const limiteMassimo = new Date(dataPrenotazione.getTime() + minutiOffset * 60 * 1000)
				if(adesso > limiteMassimo) {
					throw new Error('La data e ora della prenotazione deve essere entro 10 minuti da adesso');
				}
			}

			// Check posto
			const filiale = await Filiale.getById(Number(data.ref_filiale));
			if (!filiale) throw new Error('Filiale non trovata');
			
			const tavoliTotali = filiale.num_tavoli;
			const tavoliInUso = await this.calcolaTavoliInUso(filiale.id_filiale, data.data_ora_prenotazione);
			const tavoliOccupati = tavoliInUso[data.data_ora_prenotazione] ?? 0;
			
			const tavoliRichiesti = PrenotazioneService.calcolaTavoliRichiesti(data.numero_persone);
			
			if (tavoliOccupati + tavoliRichiesti > tavoliTotali) {
					const disponibili = tavoliTotali - tavoliOccupati;
					throw new Error(`Non ci sono abbastanza tavoli disponibili in quell'orario. Tavoli disponibili: ${disponibili}`);
			}

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

			const input: PrenotazioneInput = {
				numero_persone: data.numero_persone,
				data_ora_prenotazione: data.data_ora_prenotazione,
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

	static async modificaPrenotazione(id_prenotazione: number, numero_persone: number, data_ora_prenotazione: string): Promise<void> {
		try {
			// Check Orario
			const orariValidi = ['12:00', '13:30', '19:30', '21:00'];
			const dataPrenotazione = new Date(data_ora_prenotazione);
			const adesso = new Date();

			const ore = dataPrenotazione.getHours().toString().padStart(2, '0');
            const minuti = dataPrenotazione.getMinutes().toString().padStart(2, '0');
            const orarioPrenotato = `${ore}:${minuti}`;

            if (!orariValidi.includes(orarioPrenotato)) {
                throw new Error(`L'orario selezionato (${orarioPrenotato}) non è valido. Orari disponibili: ${orariValidi.join(', ')}`);
            }

			if(dataPrenotazione < adesso){
                throw new Error('La data e ora della prenotazione non può essere nel passato');
            }

			return await Prenotazione.update(
				id_prenotazione,
				numero_persone,
				data_ora_prenotazione
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
			const prenotazione = await Prenotazione.getById(id);
			if (!prenotazione) {
				throw new Error('Prenotazione non trovata');
			}

			const adesso = new Date();
			const dataPrenotazione = new Date(prenotazione.data_ora_prenotazione);

			if (dataPrenotazione < adesso) {
				throw new Error('Non è possibile eliminare una prenotazione passata');
			}
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

	static async getPrenotazioniDataAndFiliale(id_filiale: number, data: string): Promise<PrenotazioneRecord[] | null> {
		try {
			return await Prenotazione.getPrenotazioniDataAndFiliale(id_filiale, data);
		} catch (error) {
			console.error(
				'❌ [PrenotazioneService] Errore durante il recupero delle prenotazioni per data:',
				error
			);
			throw error;
		}
	}

	static async calcolaTavoliInUso(id_filiale: number, data: string): Promise<Record<string, number>> {
		const orariValidi = ['12:00', '13:30', '19:30', '21:00'];
		const tavoliPerOrario: Record<string, number> = {};

		for (const orario of orariValidi) {
			const data_orario = `${data} ${orario}`;
			const prenotazioni =
				await Prenotazione.getPrenotazioniDataAndFiliale(
					id_filiale,
					data_orario
				);
			tavoliPerOrario[data_orario] = 0;
			for (const p of prenotazioni) {
				const tavoli = this.calcolaTavoliRichiesti(p.numero_persone);

				tavoliPerOrario[data_orario] += tavoli;
			}
		}

		return tavoliPerOrario;
	}

	static async getStatoPrenotazioneCameriere(id_prenotazione: number): Promise<string> {
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

	static async getStatoPrenotazioneChef(id_prenotazione: number): Promise<string> {
		try {
			const otp = await Prenotazione.getOTPById(id_prenotazione);
			if (!otp) {
				return 'attesa-arrivo';
			}
			const ordini = await Ordine.getByPrenotazione(id_prenotazione);

			if (!ordini || ordini.length === 0) {
				return 'senza-ordini';
			}
			
			let hasPreparazione = false;

			for (const ordine of ordini) {
				const prodotti = await OrdProd.getByOrdine(ordine.id_ordine);

				if (prodotti == null || prodotti.length === 0) continue;

				for (const p of prodotti) {
					if (p.stato === 'non-in-lavorazione') return 'non-in-lavorazione';
					else if (p.stato === 'in-lavorazione') hasPreparazione = true;
				}
			}
			if (hasPreparazione) return 'in-lavorazione';
			return 'consegnato';
		} catch (err) {
			console.error(
				`❌ Errore nel recuperare lo stato della prenotazione ${id_prenotazione}:`,
				err
			);
			throw err;
		}
	}

	static async checkOTP(data_ora_prenotazione: string, ref_torretta: number, otp: string): Promise<number> {
		try {
			const prenotazione = await Prenotazione.getByDataETorretta(data_ora_prenotazione, ref_torretta);
			if (!prenotazione) {
				console.error('Prenotazione non trovata per i dati forniti: ', data_ora_prenotazione, ref_torretta);
				throw new Error('Prenotazione non trovata');
			}
			if (!prenotazione.otp) {
				console.error('Prenotazione non ha un OTP associato: ', prenotazione);
				throw new Error('Prenotazione non ha un OTP associato');
			}
			else if (prenotazione.otp !== otp) {
				console.error('OTP non corrisponde: ', prenotazione.otp, otp);
				throw new Error('OTP non corrisponde');
			}
			if(prenotazione.otp === otp) {
				return prenotazione.id_prenotazione;
			}
			else {
				return -1;
			}
		} catch (error) {
			console.error(
				'❌ [PrenotazioneService] Errore durante il controllo dell\'OTP:',
				error
			);
			throw error;
		}
	}
}

export default PrenotazioneService;
