import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import { htmlToText } from 'html-to-text';
import { MailOptions } from '../Interfaces/Email';

const dotenv = require('dotenv');
dotenv.config();

// Verifica che le variabili di ambiente per l'email siano definite
if (!process.env.MAIL_USER || !process.env.GOOGLE_APP_PASSWORD) {
	console.error(
		"❌ Errore: le credenziali per l'email non sono impostate correttamente!"
	);
	process.exit(1); // Termina l'applicazione se le credenziali mancano
}

// Crea il trasportatore di email utilizzando Gmail e autenticazione tramite app password
const transporter = nodemailer.createTransport({
	service: 'gmail', // Provider email (Gmail)
	auth: {
		user: process.env.MAIL_USER, // Email mittente
		pass: process.env.GOOGLE_APP_PASSWORD, // Password applicazione (non la password normale)
	},
	secure: true, // Connessione sicura tramite SSL
});

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
			const { to, subject, data } = mailOptions;

			const templatePath = path.join(
				__dirname,
				'..',
				'Email',
				'Template.hbs'
			);

			const templateSource = fs.readFileSync(templatePath, 'utf-8');
			const compiledTemplate = handlebars.compile(templateSource);

			// L'immagine sarà referenziata nel template tramite cid:logo
			const html = compiledTemplate({ ...data });
			const text = htmlToText(html);

			const mailDetails = {
				from: `"Ciscusassi" <${process.env.MAIL_USER}>`,
				to,
				subject,
				text,
				html,
				attachments: [
					{
						filename: 'logo.png',
						path: path.join(__dirname, '..', 'Assets', 'logo.png'),
						cid: 'logo',
					},
				],
			};

			await transporter.sendMail(mailDetails);
			console.log(`✅ Email inviata a ${to}`);
		} catch (error) {
			console.error("❌ Errore nell'invio dell'email:", error);
			throw new Error("Errore nell'invio dell'email");
		}
	}
}

export default EmailService;
