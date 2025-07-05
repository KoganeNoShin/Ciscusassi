import nodemailer from 'nodemailer';
const dotenv = require('dotenv');
dotenv.config();

// Verifica che le variabili di ambiente per l'email siano definite
if (!process.env.MAIL_USER || !process.env.GOOGLE_APP_PASSWORD) {
  console.error('❌ Errore: le credenziali per l\'email non sono impostate correttamente!');
  process.exit(1);  // Termina l'applicazione se le credenziali mancano
}

// Crea il trasportatore di email utilizzando Gmail e autenticazione tramite app password
const transporter = nodemailer.createTransport({
  service: "gmail",  // Provider email (Gmail)
  auth: {
    user: process.env.MAIL_USER,             // Email mittente
    pass: process.env.GOOGLE_APP_PASSWORD,   // Password applicazione (non la password normale)
  },
  secure: true, // Connessione sicura tramite SSL
});

/**
 * Interfaccia per definire le opzioni di invio dell'email
 */
interface MailOptions {
  to: string;          // Indirizzo email del destinatario
  subject: string;     // Oggetto dell'email
  text: string;        // Contenuto testuale dell'email (plain text)
  html?: string;       // Contenuto HTML dell'email (opzionale)
}

/**
 * Servizio per la gestione dell'invio email tramite nodemailer
 */
class EmailService {
  /**
   * Invia un'email con le opzioni specificate
   * 
   * @param mailOptions Oggetto contenente destinatario, oggetto, testo e HTML opzionale
   * @throws Lancia un errore in caso di fallimento dell'invio
   */
  static async sendMail(mailOptions: MailOptions): Promise<void> {
    try {
      const { to, subject, text, html } = mailOptions;

      const mailDetails = {
        from: process.env.MAIL_USER, // Email mittente
        to,
        subject,
        text,
        html,
      };

      // Invia l'email tramite il transport configurato
      await transporter.sendMail(mailDetails);
      console.log(`✅ Email inviata a ${to}`);
    } catch (error) {
      console.error('❌ Errore nell\'invio dell\'email:', error);
      throw new Error('Errore nell\'invio dell\'email');
    }
  }
}

export default EmailService;