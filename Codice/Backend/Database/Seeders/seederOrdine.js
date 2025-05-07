const ordine = require('../../Models/ordine');
const prenotazione = require('../../Models/prenotazione');
const cliente = require('../../Models/cliente');
const pagamento = require('../../Models/pagamento')

const { faker } = require('@faker-js/faker');

async function generateOrdine() {
    const idClienti = [];
    const clienti = await cliente.findAll();
    clienti.forEach(c => idClienti.push(c.numero_carta));
  
    const prenotazioni = await prenotazione.findAll();
  
    const ordiniPromises = [];
  
    for (const p of prenotazioni) {
      let nClienti = p.numero_persone;
  
      if (p.ref_cliente != null) {
        try {
          const clienteObj = await cliente.findByNumeroCarta(p.ref_cliente);
          const data_ora_ordinazione = new Date(Date.parse(p.data_ora_prenotazione) + faker.number.int({ min: 10, max: 30 }) * 60000).toISOString();
          const username_ordinante = `${clienteObj.nome}.${clienteObj.cognome}.${clienteObj.data_nascita}`;
          const ref_prenotazione = p.id_prenotazione;
          const ordineObj = await ordine.create({ data_ora_ordinazione, username_ordinante, ref_prenotazione, ref_pagamento: null, ref_cliente: p.ref_cliente });
          console.log(`🛎️  Inserito un ordine per conto di ${clienteObj.nome} ${clienteObj.cognome}, in data ${data_ora_ordinazione}!`);
          ordiniPromises.push(ordineObj);
          nClienti--;
        } catch (err) {
          console.error(`❌ Errore con ordine per ref_cliente ${p.ref_cliente}:`, err);
        }
      }
  
      for (let i = 0; i < nClienti; i++) {
        try {
          const data_ora_ordinazione = new Date(Date.parse(p.data_ora_prenotazione) + faker.number.int({ min: 10, max: 30 }) * 60000).toISOString();
          const username_ordinante = `${faker.person.firstName()}.${faker.person.lastName()}.${faker.date.birthdate().getUTCFullYear()}`;
          const ref_prenotazione = p.id_prenotazione;
          const ref_cliente = faker.number.int({ min: 1, max: 4 }) === 1 ? null : faker.helpers.arrayElement(idClienti);
  
          const ordineObj = await ordine.create({ data_ora_ordinazione, username_ordinante, ref_prenotazione, ref_pagamento: null, ref_cliente });
          console.log(`🛎️  Inserito un ordine per conto di ${username_ordinante}, in data ${data_ora_ordinazione}!`);
          ordiniPromises.push(ordineObj);
        } catch (err) {
          console.error(`❌ Errore con ordine multiplo:`, err);
        }
      }
    }
  }
  

module.exports = { generateOrdine }