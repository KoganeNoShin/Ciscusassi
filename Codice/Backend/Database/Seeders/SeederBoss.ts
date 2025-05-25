import impiegato from '../../Models/impiegato';
import filiale from '../../Models/filiale';
import fs from 'fs';
import path from 'path';


function getBase64FromFile(localPath: string): string {
	const fullPath = path.resolve(__dirname, localPath); // path assoluto
	const imageBuffer = fs.readFileSync(fullPath);
	return `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
}

export async function generateUtentiFissi(): Promise<string> {
	try {
		const filiali = await filiale.findAll();
		if (!filiali || filiali.length === 0) throw new Error("Nessuna filiale trovata");

		const f = filiali[0];
		const password = 'Pwm30L!';

		const utentiFissi = [
			{
				nome: 'Diego',
				cognome: 'Corona',
				email: 'diego.corona@community.unipa.it',
				data_nascita: '2003-07-09',
				ruolo: 'Amministratore',
				fotoUrl: './DiegoCorona.jpg',
			},
			{
				nome: 'Daniele Orazio',
				cognome: 'Susino',
				email: 'danieleorazio.susino@community.unipa.it',
				data_nascita: '1985-03-10',
				ruolo: 'Amministratore',
				fotoUrl: './DanieleOrazioSusino.jpg',
			},
			{
				nome: 'Leonardo Giovanni',
				cognome: 'Caiezza',
				email: 'leonardogiovanni.caiezza@community.unipa.it',
				data_nascita: '1992-07-20',
				ruolo: 'Amministratore',
				fotoUrl: './LeonardoGiovanniCaiezza.jpg',
			},
			{
				nome: 'Luca',
				cognome: 'Gaetani',
				email: 'luca.gaetani@community.unipa.it',
				data_nascita: '1996-11-15',
				ruolo: 'Amministratore',
				fotoUrl: './LucaGaetani.jpg',
			},
		];

		for (const utente of utentiFissi) {
			const foto = getBase64FromFile(utente.fotoUrl);

			await impiegato.create({
				nome: utente.nome,
				cognome: utente.cognome,
				ruolo: utente.ruolo,
				foto: foto,
				password: password,
				email: utente.email,
				data_nascita: utente.data_nascita,
				ref_filiale: f.id_filiale,
			});
			console.log(`✅ ${utente.nome} ${utente.cognome} (${utente.ruolo}) aggiunto con successo.`);
		}

		return '✅ Utenti fissi generati con successo!';
	} catch (err) {
		console.error('❌ Errore durante la generazione degli utenti fissi:', err);
		throw err;
	}
}

export default generateUtentiFissi;
