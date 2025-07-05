import Ordine, { OrdineInput, OrdineRecord } from '../Models/ordine';
import Prenotazione from '../Models/prenotazione';
import OrdProd from '../Models/ord_prod';
import Prodotto from '../Models/prodotto';
import Cliente from '../Models/cliente';
import Pagamento, { PagamentoInput } from '../Models/pagamento';

class OrdineService {
	/**
	 * Crea un nuovo ordine dopo aver validato il cliente e verificato l'unicità dell'username per prenotazione.
	 * @param data Dati dell'ordine (inclusi cliente, prenotazione, username)
	 * @returns ID dell'ordine creato
	 */
	static async creaOrdine(data: OrdineInput): Promise<number> {
		try {
			if (data.ref_cliente != null) {
				const cliente = await Cliente.getByNumeroCarta(data.ref_cliente);
				if (!cliente) throw new Error('Cliente non trovato');

				const [nome, cognome, anno] = data.username_ordinante.split('.');
				const annoNascitaCliente = cliente.data_nascita.split('-')[0];

				const nomeMatch = cliente.nome.toLowerCase().replace(' ', '') === nome.toLowerCase().replace(' ', '');
				const cognomeMatch = cliente.cognome.toLowerCase().replace(' ', '') === cognome.toLowerCase().replace(' ', '');
				const annoMatch = annoNascitaCliente === anno;

				if (!(nomeMatch && cognomeMatch && annoMatch)) {
					throw new Error('Username non corrisponde ai dati del cliente');
				}
			}

			const ordineEsistente = await Ordine.getOrdineByPrenotazioneAndUsername(
				data.ref_prenotazione,
				data.username_ordinante
			);

			if (ordineEsistente) {
				throw new Error('Esiste già un ordine con questo username per la stessa prenotazione');
			}

			return await Ordine.create(data);
		} catch (error) {
			console.error("❌ [OrdineService] Errore durante la creazione dell'ordine:", error);
			throw error;
		}
	}

	/**
	 * Aggiunge un pagamento a un ordine esistente, validando l'importo.
	 * @param i Importo del pagamento
	 * @param d Data e ora (formato yyyy-MM-dd HH:mm)
	 * @param id_ordine ID dell'ordine a cui associare il pagamento
	 */
	static async aggiungiPagamento(i: number, d: string, id_ordine: number): Promise<void> {
		try {
			const pagamentoData = {
				importo: i,
				data_ora_pagamento: d,
			} as PagamentoInput;

			const importo_minimo = await this.calcolaImportoTotale(id_ordine, true);
			if (importo_minimo > pagamentoData.importo) {
				throw new Error('Importi diversi nella service');
			}

			const id_pagamento = await Pagamento.create(pagamentoData);
			if (!id_pagamento) throw new Error('Creazione del pagamento fallita.');

			return await Ordine.addPagamento(id_pagamento, id_ordine);
		} catch (error) {
			console.error("❌ [OrdineService] Errore durante l'aggiunta del pagamento all'ordine:", error);
			throw error;
		}
	}

	/**
	 * Elimina un ordine dato il suo ID.
	 * @param id ID dell'ordine da eliminare
	 */
	static async eliminaOrdine(id: number): Promise<void> {
		try {
			return await Ordine.deleteOrdine(id);
		} catch (error) {
			console.error("❌ [OrdineService] Errore durante l'eliminazione dell'ordine:", error);
			throw error;
		}
	}

	/**
	 * Recupera un ordine per ID.
	 * @param id ID dell'ordine
	 * @returns OrdineRecord o null
	 */
	static async getOrdineById(id: number): Promise<OrdineRecord | null> {
		try {
			return await Ordine.getById(id);
		} catch (error) {
			console.error("❌ [OrdineService] Errore durante il recupero dell'ordine:", error);
			throw error;
		}
	}

	/**
	 * Recupera tutti gli ordini nel sistema.
	 * @returns Lista di OrdineRecord
	 */
	static async getAllOrdini(): Promise<OrdineRecord[]> {
		try {
			return await Ordine.getAll();
		} catch (error) {
			console.error('❌ [OrdineService] Errore durante il recupero degli ordini:', error);
			throw error;
		}
	}

	/**
	 * Recupera tutti gli ordini associati a un cliente.
	 * @param clienteId ID del cliente
	 * @returns Lista di OrdineRecord o null
	 */
	static async getOrdiniByCliente(clienteId: number): Promise<OrdineRecord[] | null> {
		try {
			return await Ordine.getByCliente(clienteId);
		} catch (error) {
			console.error('❌ [OrdineService] Errore durante il recupero degli ordini per cliente:', error);
			throw error;
		}
	}

	/**
	 * Recupera tutti gli ordini associati a una prenotazione.
	 * @param prenotazioneId ID della prenotazione
	 * @returns Lista di OrdineRecord o null
	 */
	static async getOrdiniByPrenotazione(prenotazioneId: number): Promise<OrdineRecord[] | null> {
		try {
			return await Ordine.getByPrenotazione(prenotazioneId);
		} catch (error) {
			console.error('❌ [OrdineService] Errore durante il recupero degli ordini per prenotazione:', error);
			throw error;
		}
	}

	/**
	 * Cerca l'ID di un ordine dato l'ID della prenotazione e l'username ordinante.
	 * @param prenotazioneID ID prenotazione
	 * @param username Username ordinante
	 * @returns ID ordine o null
	 */
	static async getOrdineByPrenotazioneAndUsername(prenotazioneID: number, username: string): Promise<number | null> {
		try {
			return await Ordine.getOrdineByPrenotazioneAndUsername(prenotazioneID, username);
		} catch (error) {
			console.error("❌ [OrdineService] Errore durante il recupero dell'ordine per prenotazione ed Username:", error);
			throw error;
		}
	}

	/**
	 * Calcola il totale dell'importo per un ordine, tenendo conto di piatti alla romana, sconti e punti fedeltà.
	 * Se `pagamento` è true, aggiorna i punti del cliente.
	 * @param ordineId ID dell'ordine
	 * @param pagamento Se true, aggiorna i punti cliente
	 * @returns Importo totale arrotondato a due decimali
	 */
	static async calcolaImportoTotale(ordineId: number, pagamento: boolean): Promise<number> {
		let ordinatoPiattoDelGiorno = false;
		const ordine = await Ordine.getById(ordineId);
		if (ordine == null) throw new Error(`Ordine con ID ${ordineId} non trovato`);

		const prenotazione = await Prenotazione.getById(ordine.ref_prenotazione);
		if (!prenotazione) throw new Error(`Prenotazione con ID ${ordine.ref_prenotazione} non trovata per ordine`);

		const prodottiNotRomana = await OrdProd.getByOrdineAndRomana(ordineId, false);
		let totaleNotRomana = 0;
		if (prodottiNotRomana && prodottiNotRomana.length !== 0) {
			for (const prod_asp of prodottiNotRomana) {
				const prodotto = await Prodotto.getByID(prod_asp.ref_prodotto);
				if (!prodotto) throw new Error(`Prodotto con ID ${prod_asp.ref_prodotto} non trovato`);
				if (prodotto.is_piatto_giorno) ordinatoPiattoDelGiorno = true;
				totaleNotRomana += prodotto.costo;
			}
		}

		const prodottiRomana = await OrdProd.getByOrdineAndRomana(ordineId, true);
		let totaleRomana = 0;
		if (prodottiRomana && prodottiRomana.length !== 0) {
			for (const prod_asp of prodottiRomana) {
				const prodotto = await Prodotto.getByID(prod_asp.ref_prodotto);
				if (!prodotto) throw new Error(`Prodotto con ID ${prod_asp.ref_prodotto} non trovato`);
				if (prodotto.is_piatto_giorno) ordinatoPiattoDelGiorno = true;
				totaleRomana += prodotto.costo;
			}
		}

		totaleRomana = totaleRomana / prenotazione.numero_persone;
		let totale = totaleNotRomana + totaleRomana;

		if (ordine.ref_cliente != null) {
			let punti = await Cliente.getPuntiCliente(ordine.ref_cliente);
			if (punti >= 50) {
				totale = (totale * 90) / 100;
				punti -= 50;
			}
			punti += Math.floor(totale / 10);
			if (ordinatoPiattoDelGiorno) punti += 10;
			if (pagamento) {
				console.log(`${ordine.ref_cliente} ${ordine.username_ordinante} nuovi punti: ${punti}`);
				Cliente.setPuntiCliente(ordine.ref_cliente, punti);
			}
		}

		return Math.ceil(totale * 100) / 100;
	}
}

export default OrdineService;