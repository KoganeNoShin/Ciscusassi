import { format } from 'date-fns';
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

/**
 * Servizio per la gestione delle prenotazioni.
 * Include metodi per la creazione, modifica, eliminazione e verifica delle prenotazioni,
 * oltre che per il calcolo dei tavoli necessari e la gestione degli OTP.
 */
class PrenotazioneService {
	/**
   * Genera un OTP alfanumerico di 6 caratteri.
   */
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

	/**
   * Calcola il numero minimo di tavoli necessari per ospitare un dato numero di persone.
   * @param numeroPersone Numero di persone
   * @returns Numero di tavoli richiesti
   */
	static calcolaTavoliRichiesti(numeroPersone: number): number {
		let numeroTavoliRichiesti = 0;
		for (let t = 1; t <= numeroPersone; t++) {
        	const postiDisponibili = 2 * t + 2;
			if (postiDisponibili >= numeroPersone) {
				numeroTavoliRichiesti = t;
				break;
			}
      	}
		return numeroTavoliRichiesti;
	}

	/**
   * Crea una nuova prenotazione standard con controllo su orari, tavoli e torrette.
   * @param data Dati della prenotazione
   * @returns ID della nuova prenotazione
   */
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

			// Check Prenotazioni future
			const prenotazioni = await Prenotazione.getByCliente(Number(data.ref_cliente));
			
			const prenotazioniFuturo = prenotazioni.filter((p) => new Date(p.data_ora_prenotazione) >= adesso);
			
			if (prenotazioniFuturo.length > 0) {
				throw new Error('Il cliente ha già una prenotazione futura. Non è possibile fare una nuova prenotazione.');
			}

			// Check posto
			const filiale = await Filiale.getById(Number(data.ref_filiale));
			if (!filiale) throw new Error('Filiale non trovata');
			
			const tavoliTotali = filiale.num_tavoli;
			const tavoliInUso = await this.calcolaTavoliInUso(filiale.id_filiale,format(dataPrenotazione, 'yyyy-MM-dd'));
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

			if (data.ref_cliente === null) {
				throw new Error('ref_cliente non può essere null');
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

	/**
   * Crea una nuova prenotazione locale con OTP, valida entro 10 minuti dall'orario attuale.
   * @param data Dati della prenotazione
   * @returns ID della nuova prenotazione
   */
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
			const tavoliInUso = await this.calcolaTavoliInUso(filiale.id_filiale, format(dataPrenotazione, 'yyyy-MM-dd'));
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

			if (data.ref_cliente === null) {
				throw new Error('ref_cliente non può essere null');
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

	/**
   * Conferma una prenotazione esistente generando un nuovo OTP.
   * @param id_prenotazione ID della prenotazione da confermare
   */
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

	/**
   * Modifica una prenotazione esistente, controllando orari e validità della data.
   * @param id_prenotazione ID prenotazione
   * @param numero_persone Nuovo numero di persone
   * @param data_ora_prenotazione Nuova data/ora della prenotazione
   */
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

	/**
   * Elimina una prenotazione futura. Le prenotazioni passate non possono essere eliminate.
   * @param id ID della prenotazione
   */
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

	/**
   * Ritorna la fascia oraria attuale se si è all'interno di una fascia valida.
   * @returns Stringa della fascia oraria corrente o null se fuori fascia
   */
	private static getFasciaOrariaCorrente(): string | null {
		const orariValidi = ['12:00', '13:30', '19:30', '21:00'];
		const now = new Date();

		const fasce = orariValidi.map(orario => {
			const [ore, minuti] = orario.split(':').map(Number);
			const dataFascia = new Date(now);
			dataFascia.setHours(ore, minuti, 0, 0);
			return dataFascia;
		});

		for (let i = 0; i < fasce.length; i++) {
			const inizio = fasce[i];
			const fine = fasce[i + 1] ?? new Date(now.setHours(23, 59, 59, 999));

			if (now >= inizio && now < fine) {
				const yyyy = inizio.getFullYear();
				const mm = (inizio.getMonth() + 1).toString().padStart(2, '0');
				const dd = inizio.getDate().toString().padStart(2, '0');
				const hh = inizio.getHours().toString().padStart(2, '0');
				const min = inizio.getMinutes().toString().padStart(2, '0');

				return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
			}
		}

		return null; // Fuori da ogni fascia (es. mattina presto)
	}

	/**
   * Restituisce l'OTP attuale associato a una torretta per la fascia oraria corrente.
   * @param id ID torretta
   * @returns OTP oppure null se non trovato o fuori fascia
   */
	static async getOTPByIdTorrettaAndData(id: number): Promise<string | null> {
		try {
			const dataOraPrenotazione = PrenotazioneService.getFasciaOrariaCorrente();
			if (!dataOraPrenotazione) return null;

			const otp = await Prenotazione.getOTPByIdTorrettaAndData(id, dataOraPrenotazione);
			return otp;
		} catch (error) {
			console.error("❌ [PrenotazioneService] Errore durante il recupero dell'OTP:", error);
			throw error;
		}
	}

	/**
   * Restituisce una prenotazione a partire dal suo ID.
   * @param id ID prenotazione
   */
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

	/**
   * Restituisce tutte le prenotazioni presenti nel sistema.
   */
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

	/**
   * Restituisce tutte le prenotazioni di un dato cliente.
   * @param clienteId ID del cliente
   */
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

	/**
   * Restituisce tutte le prenotazioni di una filiale per una data specifica.
   * @param id_filiale ID filiale
   * @param data Data nel formato yyyy-MM-dd HH:mm
   */
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

	/**
   * Calcola il numero totale di tavoli usati in ogni fascia oraria valida per una data.
   * @param id_filiale ID filiale
   * @param data Data in formato yyyy-MM-dd
   * @returns Oggetto con chiavi "yyyy-MM-dd HH:mm" e valore = tavoli occupati
   */
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
				if(p.data_ora_prenotazione == data_orario) {
					const tavoli = this.calcolaTavoliRichiesti(p.numero_persone);
					tavoliPerOrario[data_orario] += tavoli;
				}
			}
		}
		return tavoliPerOrario;
	}

	/**
	 * Restituisce lo stato della prenotazione dal punto di vista del cameriere.
	 * Possibili stati:
	 * - "attesa-arrivo": il cliente non ha ancora confermato l'arrivo (manca OTP)
	 * - "senza-ordini": prenotazione confermata ma senza ordini associati
	 * - "in-consegna": almeno un prodotto è in consegna
	 * - "in-lavorazione": almeno un prodotto è in preparazione
	 * - "consegnato": tutti i prodotti sono stati consegnati
	 * - "non-in-lavorazione": ci sono ordini ma nessun prodotto da preparare
	 * 
	 * @param id_prenotazione ID della prenotazione
	 * @returns Stato attuale della prenotazione
	 */
	static async getStatoPrenotazioneCameriere(id_prenotazione: number): Promise<string> {
		try {
			// Recupera l'OTP associato alla prenotazione per capire se il cliente è arrivato
			const otp = await Prenotazione.getOTPById(id_prenotazione);

			// Se l'OTP non esiste, significa che il cliente non ha ancora confermato l'arrivo
			if (!otp) {
				return 'attesa-arrivo';
			}

			// Recupera tutti gli ordini associati alla prenotazione
			const ordini = await Ordine.getByPrenotazione(id_prenotazione);

			// Se non ci sono ordini, significa che nessuno ha ancora ordinato
			if (!ordini || ordini.length === 0) {
				return 'senza-ordini';
			}

			// Per ogni ordine, controlla i prodotti associati
			for (const ordine of ordini) {
				const prodotti = await OrdProd.getByOrdine(ordine.id_ordine);

				// Se non ci sono prodotti per questo ordine, passa al prossimo
				if (prodotti == null || prodotti.length === 0) continue;

				let hasPreparazione = false;     // Almeno un prodotto è in preparazione
				let hasInConsegna = false;       // Almeno un prodotto è in consegna
				let allConsegnati = true;        // Tutti i prodotti sono stati consegnati

				// Controlla lo stato di ogni prodotto
				for (const p of prodotti) {
					if (p.stato === 'in-consegna') {
						hasInConsegna = true;
					} else if (p.stato === 'in-lavorazione') {
						hasPreparazione = true;
					} else if (p.stato !== 'consegnato') {
						allConsegnati = false; // Se esiste almeno un prodotto non consegnato
					}

					// Se c'è almeno un prodotto in consegna, torna subito questo stato
					if (hasInConsegna) return 'in-consegna';
				}

				// Se almeno un prodotto è in lavorazione, ritorna questo stato
				if (hasPreparazione) return 'in-lavorazione';

				// Se tutti i prodotti risultano consegnati, ritorna 'consegnato'
				if (allConsegnati) return 'consegnato';
			}

			// Se nessuna delle condizioni precedenti è vera,
			// ma ci sono comunque ordini e prodotti non in lavorazione, restituisce stato neutro
			return 'non-in-lavorazione';
		} catch (err) {
			console.error(
				`❌ Errore nel recuperare lo stato della prenotazione ${id_prenotazione}:`,
				err
			);
			throw err;
		}
	}


	 /**
	 * Ritorna lo stato corrente della prenotazione lato chef.
	 * Possibili stati:
	 * - "attesa-arrivo": il cliente non ha ancora confermato l'arrivo (manca OTP)
	 * - "senza-ordini": la prenotazione non ha ancora ordini associati
	 * - "non-in-lavorazione": esistono prodotti che non sono stati ancora presi in carico
	 * - "in-lavorazione": almeno un prodotto è in preparazione
	 * - "consegnato": tutti i prodotti sono stati completati e consegnati
	 * 
	 * @param id_prenotazione ID della prenotazione
	 * @returns Stato attuale della prenotazione lato chef
	 */
	static async getStatoPrenotazioneChef(id_prenotazione: number): Promise<string> {
		try {
			// Controlla se l'OTP è stato generato (cioè se il cliente è arrivato)
			const otp = await Prenotazione.getOTPById(id_prenotazione);
			if (!otp) {
				return 'attesa-arrivo';
			}

			// Recupera tutti gli ordini associati alla prenotazione
			const ordini = await Ordine.getByPrenotazione(id_prenotazione);

			// Se non ci sono ordini, la prenotazione è "vuota"
			if (!ordini || ordini.length === 0) {
				return 'senza-ordini';
			}

			let hasPreparazione = false; // Flag che indica se c'è almeno un prodotto in lavorazione

			// Per ogni ordine, analizza i prodotti associati
			for (const ordine of ordini) {
				const prodotti = await OrdProd.getByOrdine(ordine.id_ordine);

				// Se non ci sono prodotti per l'ordine, salta al successivo
				if (prodotti == null || prodotti.length === 0) continue;

				// Analizza lo stato di ciascun prodotto
				for (const p of prodotti) {
					if (p.stato === 'non-in-lavorazione') {
						// Appena ne trova uno non ancora preso in carico, ritorna subito
						return 'non-in-lavorazione';
					} else if (p.stato === 'in-lavorazione') {
						hasPreparazione = true;
					}
				}
			}

			// Se almeno un prodotto è in lavorazione, lo stato è "in-lavorazione"
			if (hasPreparazione) return 'in-lavorazione';

			// Se non ci sono prodotti da lavorare né in lavorazione, tutto è stato consegnato
			return 'consegnato';
		} catch (err) {
			console.error(
				`❌ Errore nel recuperare lo stato della prenotazione ${id_prenotazione}:`,
				err
			);
			throw err;
		}
	}

	 /**
   * Verifica l'OTP associato a una prenotazione con torretta e orario.
   * @param data_ora_prenotazione Data e ora (yyyy-MM-dd HH:mm)
   * @param ref_torretta ID torretta
   * @param otp OTP da verificare
   * @returns ID prenotazione se corretto, -1 altrimenti
   */
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
