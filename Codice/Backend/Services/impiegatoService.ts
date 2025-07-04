import Impiegato, { ImpiegatoData, ImpiegatoInput, ImpiegatoRecord } from '../Models/impiegato';
import bcrypt from 'bcryptjs';
import AuthService from './authService';
import EmailService from '../Email/emailService';

class ImpiegatoService {
    static async addImpiegato(nome: string, cognome: string, ruolo: string, foto: string, email: string, data_nascita: string, ref_filiale: number): Promise<number> {
        try {
            const NotHashedPassword = AuthService.generateRandomPassword();
            const password = await AuthService.hashPassword(NotHashedPassword);
            const impiegato: ImpiegatoInput = {nome, cognome, ruolo, foto, email, data_nascita, ref_filiale, password};
            const idImpiegato = await Impiegato.create(impiegato);

            const mailOptions = {
                to: email,  // Email del cliente
                subject: 'Nuova Assunzione',
                text: `Ciao ${nome} ${cognome}, sei stato assunto nel ruolo di ${ruolo}, ecco la tua password per accedere al pannello di controllo: ${NotHashedPassword}`,
                html: `Ciao ${nome} ${cognome}, sei stato assunto nel ruolo di ${ruolo}, ecco la tua password per accedere al pannello di controllo: ${NotHashedPassword}`,
            };

            await EmailService.sendMail(mailOptions);

            return idImpiegato;
        }catch (error) {
            console.error('❌ [ImpiegatoService] Errore durante l\'aggiunta dell\'impiegato:', error);
            throw error;
        }
    }

    static async updateImpiegato(input: ImpiegatoData, matricola: number): Promise<void> {
        try {
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

    static async getByFiliale(id_filiale: number): Promise<ImpiegatoRecord[] | null> {
        try {
            return await Impiegato.getByFiliale(id_filiale);
        } catch (error) {
            console.error('❌ [ImpiegatoService] Errore durante la selezione degli impiegato:', error);
            throw error;
        }
    }
}
export default ImpiegatoService;
