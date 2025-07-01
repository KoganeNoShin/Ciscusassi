import impiegato from '../../Models/impiegato';
import filiale from '../../Models/filiale';
import fs from 'fs';
import path from 'path';
import Cliente from '../../Models/cliente';

function getBase64FromFile(localPath: string): string {
	const fullPath = path.resolve(__dirname, localPath); // path assoluto
	const imageBuffer = fs.readFileSync(fullPath);
	return `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
}

export async function generateUtentiFissi(): Promise<string> {
	try {
		const filiali = await filiale.getAll();
		if (!filiali || filiali.length === 0)
			throw new Error('Nessuna filiale trovata');
		const password = 'Pwm30L!';

		const utentiFissi = [
			// Amministratori
			{
				nome: 'Diego',
				cognome: 'Corona',
				email: 'diego.corona@amministratore.it',
				data_nascita: '2003-07-09',
				ruolo: 'Amministratore',
				fotoUrl: './DiegoCorona.jpg',
				ref_filiale: filiali[3].id_filiale,
			},
			{
				nome: 'Daniele Orazio',
				cognome: 'Susino',
				email: 'danieleorazio.susino@amministratore.it',
				data_nascita: '1985-03-10',
				ruolo: 'Amministratore',
				fotoUrl: './DanieleOrazioSusino.jpg',
				ref_filiale: filiali[2].id_filiale,
			},
			{
				nome: 'Leonardo Giovanni',
				cognome: 'Caiezza',
				email: 'leonardogiovanni.caiezza@amministratore.it',
				data_nascita: '1992-07-20',
				ruolo: 'Amministratore',
				fotoUrl: './LeonardoGiovanniCaiezza.jpg',
				ref_filiale: filiali[1].id_filiale,
			},
			{
				nome: 'Luca',
				cognome: 'Gaetani',
				email: 'luca.gaetani@amministratore.it',
				data_nascita: '1996-11-15',
				ruolo: 'Amministratore',
				fotoUrl: './LucaGaetani.jpg',
				ref_filiale: filiali[0].id_filiale,
			},
			// Chef
			{
				nome: 'Diego',
				cognome: 'Corona',
				email: 'diego.corona@chef.it',
				data_nascita: '2003-07-09',
				ruolo: 'Chef',
				fotoUrl: './DiegoCorona.jpg',
				ref_filiale: filiali[3].id_filiale,
			},
			{
				nome: 'Daniele Orazio',
				cognome: 'Susino',
				email: 'danieleorazio.susino@chef.it',
				data_nascita: '1985-03-10',
				ruolo: 'Chef',
				fotoUrl: './DanieleOrazioSusino.jpg',
				ref_filiale: filiali[2].id_filiale,
			},
			{
				nome: 'Leonardo Giovanni',
				cognome: 'Caiezza',
				email: 'leonardogiovanni.caiezza@chef.it',
				data_nascita: '1992-07-20',
				ruolo: 'Chef',
				fotoUrl: './LeonardoGiovanniCaiezza.jpg',
				ref_filiale: filiali[1].id_filiale,
			},
			{
				nome: 'Luca',
				cognome: 'Gaetani',
				email: 'luca.gaetani@chef.it',
				data_nascita: '1996-11-15',
				ruolo: 'Chef',
				fotoUrl: './LucaGaetani.jpg',
				ref_filiale: filiali[0].id_filiale,
			},
			// Camerieri
			{
				nome: 'Diego',
				cognome: 'Corona',
				email: 'diego.corona@cameriere.it',
				data_nascita: '2003-07-09',
				ruolo: 'Cameriere',
				fotoUrl: './DiegoCorona.jpg',
				ref_filiale: filiali[3].id_filiale,
			},
			{
				nome: 'Daniele Orazio',
				cognome: 'Susino',
				email: 'danieleorazio.susino@cameriere.it',
				data_nascita: '1985-03-10',
				ruolo: 'Cameriere',
				fotoUrl: './DanieleOrazioSusino.jpg',
				ref_filiale: filiali[2].id_filiale,
			},
			{
				nome: 'Leonardo Giovanni',
				cognome: 'Caiezza',
				email: 'leonardogiovanni.caiezza@cameriere.it',
				data_nascita: '1992-07-20',
				ruolo: 'Cameriere',
				fotoUrl: './LeonardoGiovanniCaiezza.jpg',
				ref_filiale: filiali[1].id_filiale,
			},
			{
				nome: 'Luca',
				cognome: 'Gaetani',
				email: 'luca.gaetani@cameriere.it',
				data_nascita: '1996-11-15',
				ruolo: 'Cameriere',
				fotoUrl: './LucaGaetani.jpg',
				ref_filiale: filiali[0].id_filiale,
			}
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
				ref_filiale: utente.ref_filiale,
			});
			console.log(
				`✅ ${utente.nome} ${utente.cognome} (${utente.ruolo}) aggiunto con successo.`
			);
		}

		const ClientiFissi = [
			{
				nome: 'Diego',
				cognome: 'Corona',
				email: 'diego.corona@community.unipa.it',
				data_nascita: '2003-07-09',
				fotoUrl: './DiegoCorona.jpg'
			},
			{
				nome: 'Daniele Orazio',
				cognome: 'Susino',
				email: 'danieleorazio.susino@community.unipa.it',
				data_nascita: '1985-03-10',
				fotoUrl: './DanieleOrazioSusino.jpg'
			},
			{
				nome: 'Leonardo Giovanni',
				cognome: 'Caiezza',
				email: 'leonardogiovanni.caiezza@community.unipa.it',
				data_nascita: '1992-07-20',
				fotoUrl: './LeonardoGiovanniCaiezza.jpg'
			},
			{
				nome: 'Luca',
				cognome: 'Gaetani',
				email: 'luca.gaetani@community.unipa.it',
				data_nascita: '1996-11-15',
				fotoUrl: './LucaGaetani.jpg'
			}
		];

		for(const cliente of ClientiFissi) {
			const foto = getBase64FromFile(cliente.fotoUrl);

			await Cliente.create({
				nome: cliente.nome,
				cognome: cliente.cognome,
				image: foto,
				password: password,
				email: cliente.email,
				data_nascita: cliente.data_nascita
			});
			console.log(
				`✅ ${cliente.nome} ${cliente.cognome} aggiunto con successo.`
			);
		}

		return '✅ Utenti fissi generati con successo!';
	} catch (err) {
		console.error(
			'❌ Errore durante la generazione degli utenti fissi:',
			err
		);
		throw err;
	}
}

export default generateUtentiFissi;
