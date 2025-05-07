const migrationCliente = require('./Database/Migrations/migrationCliente');
const migrationFiliale = require('./Database/Migrations/migrationFiliale');
const migrationImpiegato = require('./Database/Migrations/migrationImpiegato');
const migrationPagamento = require('./Database/Migrations/migrationPagamento');
const migrationTorretta = require('./Database/Migrations/migrationTorretta');
const migrationProdotto = require('./Database/Migrations/migrationProdotto');
const migrationPrenotazione = require('./Database/Migrations/migrationPrenotazione');
const migrationOrdine = require('./Database/Migrations/migrationOrdine');
const migrationOrdProdotto = require('./Database/Migrations/migrationOrdProd');
const migrationAsporto = require('./Database/Migrations/migrationAsporto');
const migrationAspProd = require('./Database/Migrations/migrationAspProd');

const seederCliente = require('./Database/Seeders/seederCliente');
const seederFiliale = require('./Database/Seeders/seederFiliale');
const seederTorretta = require('./Database/Seeders/seederTorretta');
const seederImpiegato = require('./Database/Seeders/seederImpiegato');
const seederProdotto = require('./Database/Seeders/seederProdotto');
const seederAsporto = require('./Database/Seeders/seederAsporto');
const seederAspProd = require('./Database/Seeders/seederAspProd');
const seederPrenotazione = require('./Database/Seeders/seederPrenotazione');
const seederOrdine = require('./Database/Seeders/seederOrdine');
const seederOrdProd = require('./Database/Seeders/seederOrdProd');
const seederPagamento = require('./Database/Seeders/seederPagamento');

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

async function seedDB(){
    await seederCliente.generateCliente(15);
    await seederFiliale.generateFiliale();
    await seederTorretta.generateTorretta();
    await seederImpiegato.generateImpiegato();
    await seederProdotto.generateProdotto(20);
    await seederAsporto.generateAsporto(20);
    await seederAspProd.generateAspProd();
    await seederPrenotazione.generatePrenotazione(30);
    await seederOrdine.generateOrdine();
    await seederOrdProd.generateOrdProd();
    await seederPagamento.generatePagamento();
}

async function run()
{
    if (args.includes('--help')) 
    {
        console.log("ℹ️  Usa --reset per droppare le tabelle e ricostruire il DB da capo.");
        console.log("ℹ️  Usa --seed per popolare le tabelle con dati randomici ma consistenti.");
        return;
    } 
    else if(args.includes('--reset'))
    {
        await dropAll();
    }
    
    await createTables();

    if(args.includes('--seed'))
    {
        await seedDB();
    }
}


run().catch((err) =>{
    console.error(err);
});
