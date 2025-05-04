const pagamento = require('../../Models/pagamento');
const ordine = require('../../Models/ordine');
const ord_prod = require('../../Models/ord_prod');
const prodotto = require('../../Models/prodotto');

const { faker } = require('@faker-js/faker');

async function generatePagamento() {

    return new Promise(async (resolve, reject) => {

        try{

            const ordini = await ordine.findAll();

            for (const o of ordini){
                let importo = 0;

                const ordProds = await ord_prod.findByRefOrdine(o.id_ordine);

                for (const op of ordProds) {
                    const p = await prodotto.findById(op.ref_prodotto);
                    importo += p.costo;
                }

                importo = Math.round(importo * 10) / 10;

                console.log(`💳 L'ordine con id ${o.id_ordine} ha avuto un importo totale di ${importo}`);

                // Se vuoi anche generare il pagamento nel DB:
                await pagamento.create({                    
                    importo: importo,
                    data_ora_pagamento: new Date( Date.parse(o.data_ora_ordinazione) + faker.number.int({min: 70, max: 120}) * 60 * 1000).toISOString()
                });

            }

        }catch(err){
            console.error("❌ Errore durante la generazione dei pagamenti:", err);
            reject(err);
        }        

        resolve();

    });


}

module.exports = { generatePagamento }