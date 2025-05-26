import Filiale from '../Models/filiale';
import Impiegato, { ImpiegatoData, ImpiegatoInput, ImpiegatoRecord } from '../Models/impiegato';

class ImpiegatoService {
    private static async validateImpiegato(input: ImpiegatoData): Promise<void> {
        // Nome e Cognome
        if (!input.nome || input.nome.trim() === '') {
            throw new Error('Il nome è obbligatorio.');
        }
        if (!input.cognome || input.cognome.trim() === '') {
            throw new Error('Il cognome è obbligatorio.');
        }

        // Ruolo
        const ruoliAmmessi = ['Amministratore', 'Chef', 'Cameriere'];
        if (!ruoliAmmessi.includes(input.ruolo)) {
            throw new Error(`Il ruolo "${input.ruolo}" non è valido. Ruoli ammessi: ${ruoliAmmessi.join(', ')}.`);
        }

        // Foto
        if (!input.foto || !input.foto.startsWith('data:image/')) {
            throw new Error('La foto deve essere in formato base64 valido (data:image/...).');
        }

        // Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.email)) {
            throw new Error('L\'email non è valida.');
        }

        // Data di nascita
        const timestamp = Date.parse(input.data_nascita);
        if (isNaN(timestamp)) {
            throw new Error('La data di nascita non è valida.');
        }
        const data = new Date(timestamp);
        const oggi = new Date();
        if (data > oggi) {
            throw new Error('La data di nascita non può essere nel futuro.');
        }

        // Ref filiale
        const filiale = await Filiale.getById(input.ref_filiale);
        if (!filiale) {
            throw new Error(`Filiale con ID ${input.ref_filiale} non esiste.`);
        }
    }

    private static async validateImpiegatoInput(input: ImpiegatoInput): Promise<void> {
        // Password
        if (!input.password || input.password.length < 8) {
            throw new Error('La password deve contenere almeno 8 caratteri.');
        }

        await this.validateImpiegato(input);
    }

    static async addImpiegato(input: ImpiegatoInput): Promise<number> {
        try {
            await this.validateImpiegatoInput(input);
            return await Impiegato.create(input);
        }catch (error) {
            console.error('❌ [ImpiegatoService] Errore durante l\'aggiunta dell\'impiegato:', error);
            throw error;
        }
    }

    static async updateImpiegato(input: ImpiegatoData, matricola: number): Promise<void> {
        try {
            this.validateImpiegato(input);
            await Impiegato.updateImpiegato(input, matricola);
        } catch (error) {
            console.error('❌ [ImpiegatoService] Errore durante l\'aggiornamento dell\'impiegato:', error);
            throw error;
        }
    }

    static async deleteImpiegato(matricola: number): Promise<void> {
        try {
            await Impiegato.deleteImpiegato(matricola);
        } catch (error) {
            console.error('❌ [ImpiegatoService] Errore durante l\'eliminazione dell\'impiegato:', error);
            throw error;
        }
    }

    static async getAllImpiegati(): Promise<ImpiegatoRecord[] | null> {
        const impiegati = await Impiegato.findAll();
        return impiegati || null;
    }
}
export default ImpiegatoService;
