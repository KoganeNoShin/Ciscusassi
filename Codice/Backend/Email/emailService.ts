import nodemailer from 'nodemailer';
const dotenv = require('dotenv');
dotenv.config();

if (!process.env.MAIL_USER || !process.env.GOOGLE_APP_PASSWORD) {
  console.error('❌ Errore: le credenziali per l\'email non sono impostate correttamente!');
  process.exit(1);  // Termina l'applicazione se le credenziali mancano
}

// Crea il trasportatore di email
const transporter = nodemailer.createTransport({
  service: "gmail",  // Usa 'gmail' come provider
  auth: {
    user: process.env.MAIL_USER,  // La tua email
    pass: process.env.GOOGLE_APP_PASSWORD,  // La tua app password
  },
  secure: true, // Usa SSL
});

interface MailOptions {
  to: string;          // Destinatario
  subject: string;     // Oggetto
  text: string;        // Corpo del messaggio (testo semplice)
  html?: string;       // Corpo opzionale in HTML
}

class EmailService {
  // Metodo per inviare email
  static async sendMail(mailOptions: MailOptions): Promise<void> {
    try {
      const { to, subject, text, html } = mailOptions;
      
      const mailDetails = {
        from: process.env.MAIL_USER,
        to,
        subject,
        text,
        html,
      };

      // Invio dell'email
      await transporter.sendMail(mailDetails);
      console.log(`✅ Email inviata a ${to}`);
    } catch (error) {
      console.error('❌ Errore nell\'invio dell\'email:', error);
      throw new Error('Errore nell\'invio dell\'email');
    }
  }
}

export default EmailService;
