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

import seederCliente from './Database/Seeders/seederCliente';
import seederFiliale from './Database/Seeders/seederFiliale';
import seederTorretta from './Database/Seeders/seederTorretta';
import seederImpiegato from './Database/Seeders/seederImpiegato';
import seederProdotto from './Database/Seeders/seederProdotto';
import seederAsporto from './Database/Seeders/seederAsporto';
import seederAspProd from './Database/Seeders/seederAspProd';
import seederPrenotazione from './Database/Seeders/seederPrenotazione';
import seederOrdine from './Database/Seeders/seederOrdine';
import seederOrdProd from './Database/Seeders/seederOrdProd';
import seederPagamento from './Database/Seeders/seederPagamento';

const args = process.argv.slice(2);

async function dropAll() {
    await migrationCliente.dropTable();
    await migrationFiliale.dropTable();
    await migrationImpiegato.dropTable();
    await migrationPagamento.dropTable();
    await migrationTorretta.dropTable();
    await migrationProdotto.dropTable();
    await migrationPrenotazione.dropTable();
    await migrationOrdine.dropTable();
    await migrationOrdProdotto.dropTable();
    await migrationAsporto.dropTable();
    await migrationAspProd.dropTable();
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
    await seederCliente.generateCliente(15);
    await seederFiliale.generateFiliale();
    await seederTorretta.generateTorretta();
    await seederImpiegato.generateImpiegato();
    await seederProdotto.generateProdotto();
    await seederAsporto.generateAsporto(20);
    await seederAspProd.generateAspProd();
    await seederPrenotazione.generatePrenotazione(30);
    await seederOrdine.generateOrdine();
    await seederOrdProd.generateOrdProd();
    await seederPagamento.generatePagamento();
}

async function run() {
    if (args.includes('--help')) {
        console.log("ℹ️  Usa --reset per droppare le tabelle e ricostruire il DB da capo.");
        console.log("ℹ️  Usa --seed per popolare le tabelle con dati randomici ma consistenti.");
    }
    else if (args.includes('--reset')) {
        await dropAll();
    }

    await createTables();

    if (args.includes('--seed')) {
        await seedDB();
    }
}


run().catch((err) => {
    console.error(err);
});
