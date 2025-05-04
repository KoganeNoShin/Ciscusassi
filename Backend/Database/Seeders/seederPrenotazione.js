const prenotazione = require('../../Models/prenotazione');
const torretta = require('../../Models/torretta');
const cliente = require('../../Models/cliente');

const { faker } = require('@faker-js/faker');

async function generatePrenotazione(count) 
{

    return new Promise(async (resolve, reject) => {

        let prenotazioniPromises = [];

        let idTorrette = [];
        let idClienti = [];

        await torretta.findAll().then( (torrette) => {
            torrette.forEach(t => {
                idTorrette.push(t.id_torretta);
            });
        }).catch((err) => {
            throw err;
        });

        await cliente.findAll().then( (clienti) => {
            clienti.forEach(p => {
                idClienti.push(p.numero_carta);
            });
        }).catch((err) => {
            throw err;
        });

        for (let i = 0; i < count; i++) 
        {         
            let numero_persone = faker.number.int({min: 1, max: 8})           ;
            let ref_cliente = faker.number.int({min: 0, max:1}) == 0 ? faker.helpers.arrayElement(idClienti) : null;
            let ref_torretta = faker.helpers.arrayElement(idTorrette);
            let data_ora_prenotazione = faker.date.anytime().toISOString();
            let otp = faker.string.alphanumeric( {length: 6} );

            let prenotazionePromise = prenotazione.create({numero_persone: numero_persone, ref_cliente: ref_cliente, ref_torretta: ref_torretta, data_ora_prenotazione: data_ora_prenotazione, otp: otp}).then( () => {
                console.log(`📆  Aggiunta la prenotazione di ${numero_persone} persone giorno ${data_ora_prenotazione}. Gli è stata assegnata la torretta ${ref_torretta} ed è stata ${ref_cliente == null ? "creata in loco." : `creata online dall'utente ${ref_cliente}.`}`);
            }).catch( (err) => {
                console.log(`❌ Impossibile aggiungere la prenotazione in giorno ${data_ora_prenotazione}. Motivo: ${err}`);
                throw err;
            });   

            prenotazioniPromises.push(prenotazionePromise);            
        }

        // Usiamo promise all per assicurarci che tutti gli aspProd siano stati creati!

        Promise.all(prenotazioniPromises)
        .then(() => {
            resolve();
        })
        .catch((err) => {
            reject(err);
        });        

    });


}

module.exports = { generatePrenotazione }