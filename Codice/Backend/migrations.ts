// Importiamo le migrations per creare le tabelle

import migrationCliente from './Database/Migrations/migrationCliente';
import migrationFiliale from './Database/Migrations/migrationFiliale';
import migrationImpiegato from './Database/Migrations/migrationImpiegato';
import migrationPagamento from './Database/Migrations/migrationPagamento';
import migrationTorretta from './Database/Migrations/migrationTorretta';
import migrationProdotto from './Database/Migrations/migrationProdotto';
import migrationPrenotazione from './Database/Migrations/migrationPrenotazione';
import migrationOrdine from './Database/Migrations/migrationOrdine';
import migrationOrdProdotto from './Database/Migrations/migrationOrdProd';
import migrationAsporto from './Database/Migrations/migrationAsporto';
import migrationAspProd from './Database/Migrations/migrationAspProd';

// Importiamo i seeder per popolare le tabelle

import generateCliente from './Database/Seeders/seederCliente';
import generateFiliale from './Database/Seeders/seederFiliale';
import generateProdotto from './Database/Seeders/seederProdotto';
import generateAsporto from './Database/Seeders/seederAsporto';
import generatePrenotazione from './Database/Seeders/seederPrenotazione';
import generateUtentiFissi from './Database/Seeders/SeederBoss';

const args = process.argv.slice(2);

async function dropAll() {
	await migrationAspProd.dropTable(); // dipende da Asporto e Prodotto
	await migrationAsporto.dropTable(); // dipende da Cliente
	await migrationOrdProdotto.dropTable(); // dipende da Ordine e Prodotto
	await migrationOrdine.dropTable(); // dipende da Cliente e Filiale
	await migrationPrenotazione.dropTable();
	await migrationProdotto.dropTable();
	await migrationTorretta.dropTable();
	await migrationPagamento.dropTable();
	await migrationImpiegato.dropTable();
	await migrationFiliale.dropTable();
	await migrationCliente.dropTable();
}

async function createTables() {
	await migrationCliente.createIfDoesntExists();
	await migrationFiliale.createIfDoesntExists();
	await migrationImpiegato.createIfDoesntExists();
	await migrationPagamento.createIfDoesntExists();
	await migrationTorretta.createIfDoesntExists();
	await migrationProdotto.createIfDoesntExists();
	await migrationOrdProdotto.createIfDoesntExists();
	await migrationOrdine.createIfDoesntExists();
	await migrationAsporto.createIfDoesntExists();
	await migrationAspProd.createIfDoesntExists();
	await migrationPrenotazione.createIfDoesntExists();
}

async function seedDB() {
	// 1. Avvia in parallelo clienti e filiali
	const [_, __] = await Promise.all([generateCliente(15), generateFiliale()]);

	// 2. Utenti fissi ha bisogno delle filiali già esistenti
	await generateUtentiFissi();

	// 3. Prodotto può essere fatto a parte
	await generateProdotto();

	// 4. Asporto e Prenotazioni possono partire in parallelo, se usano dati già pronti
	await Promise.all([
		generateAsporto(50),
		generatePrenotazione(50)
	]);
	console.log('✅ Database seed completato con successo!');
}

async function run() {
	if (args.includes('--help')) {
		console.log(
			'ℹ️  Usa --reset per droppare le tabelle e ricostruire il DB da capo.'
		);
		console.log(
			'ℹ️  Usa --seed per popolare le tabelle con dati randomici ma consistenti.'
		);
	} else if (args.includes('--reset')) {
		await dropAll();
	}

	await createTables();

	if (args.includes('--seed')) {
		await seedDB();
	}
}

run()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
