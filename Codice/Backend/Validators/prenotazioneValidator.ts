import { body, ValidationChain } from 'express-validator';
import Prenotazione from '../Models/prenotazione';
import { idFilialeValidator } from './filialeValidator';
import { idTorrettaValidator } from './torrettaValidator';
import { numeroCartaValidator } from './clienteValidator';

/**
 * Valida il campo `data_ora_prenotazione`:
 * - Obbligatorio
 * - Formato richiesto: `yyyy-MM-dd HH:mm`
 *
 * @param chain Catena di validazione per il campo
 * @returns Catena di validazione con controlli applicati
 */
function data_ora_prenotazioneValidator(chain: ValidationChain): ValidationChain {
	return chain
		.notEmpty().withMessage('La data e ora della prenotazione è obbligatoria')
		.matches(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/)
		.withMessage('La data di prenotazione deve essere nel formato "yyyy-MM-dd HH:mm"');
}

/**
 * Valida il campo `numero_persone`:
 * - Obbligatorio
 * - Deve essere un intero positivo >= 1
 *
 * @param chain Catena di validazione per il campo
 * @returns Catena di validazione con controlli applicati
 */
function numuroPersoneValidator(chain: ValidationChain): ValidationChain {
	return chain
		.notEmpty().withMessage('Il numero di persone è obbligatorio!')
		.isInt({ min: 1 }).withMessage('Il numero di persone deve essere un intero positivo')
		.toInt();
}

/**
 * Valida il parametro `id_prenotazione`:
 * - Obbligatorio
 * - Deve essere un intero positivo
 * - Verifica che esista nel database
 *
 * @param chain Catena di validazione per il campo
 * @returns Catena di validazione con controlli applicati
 */
export function idPrenotazioneValidator(chain: ValidationChain): ValidationChain {
	return chain
		.notEmpty().withMessage('ID Prenotazione obbligatorio')
		.isInt({ min: 1 }).withMessage('ID Prenotazione non valido')
		.toInt()
		.bail()
		.custom(async (value) => {
			const esiste = await Prenotazione.getById(value);
			if (!esiste) throw new Error('La prenotazione specificata non esiste');
			return true;
		});
}

/**
 * Valida il campo `otp` come stringa non vuota.
 *
 * @param chain Catena di validazione per il campo
 * @returns Catena di validazione con controlli applicati
 */
function OTPValidator(chain: ValidationChain): ValidationChain {
	return chain
		.trim()
		.notEmpty().withMessage('OTP non può essere vuoto.');
}

// === Validatori ===

/**
 * Valida i campi obbligatori per la creazione di una prenotazione classica:
 * - `data_ora_prenotazione`
 * - `ref_filiale`
 * - `numero_persone`
 */
export const prenotazioneInputValidator = [
	data_ora_prenotazioneValidator(body('data_ora_prenotazione')),
	idFilialeValidator(body('ref_filiale')),
	numuroPersoneValidator(body('numero_persone')),
];

/**
 * Valida i campi obbligatori per l'aggiornamento di una prenotazione:
 * - `data_ora_prenotazione`
 * - `ref_filiale`
 * - `numero_persone`
 * - `id_prenotazione`
 */
export const prenotazioneUpdateValidator = [
	...prenotazioneInputValidator,
	idPrenotazioneValidator(body('id_prenotazione'))
];

/**
 * Valida i campi per la prenotazione in loco:
 * - `numero_persone`
 * - `data_ora_prenotazione`
 * - `ref_cliente`: include validazione `custom` che impedisce di prenotare se esiste già una prenotazione futura.
 */
export const prenotazioneInputLocoValidator = [
	numuroPersoneValidator(body('numero_persone')),
	data_ora_prenotazioneValidator(body('data_ora_prenotazione')),
	numeroCartaValidator(
		body('ref_cliente')
			/** Custom:
			 * Verifica se il cliente (individuato dal numero carta) ha già una prenotazione futura.
			 * Se esiste almeno una prenotazione con data >= ora attuale, la validazione fallisce.
			 */
			.custom(async (numeroCarta: number, { req }) => {
				const prenotazioni = await Prenotazione.getByCliente(numeroCarta);
				const dataPrenotazione = new Date(req.body.data_ora_prenotazione);

				const prenotazioniFuturo = prenotazioni.filter(
					(p) => new Date(p.data_ora_prenotazione) >= dataPrenotazione
				);

				if (prenotazioniFuturo.length > 0) {
					throw new Error(
						'Il cliente ha già una prenotazione futura. Non è possibile fare una nuova prenotazione.'
					);
				}

				return true;
			})
	),
];

/**
 * Valida i campi necessari per il controllo OTP:
 * - `otp`: stringa non vuota
 * - `data_ora_prenotazione`: formato corretto
 * - `ref_torretta`: id torretta valido
 */
export const checkOTPValidator = [
	OTPValidator(body('otp')),
	data_ora_prenotazioneValidator(body('data_ora_prenotazione')),
	idTorrettaValidator(body('ref_torretta')),
];