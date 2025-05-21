import asporto from '../../Models/asporto';
import cliente, { ClienteRecord } from '../../Models/cliente';

import { faker } from '@faker-js/faker';

export async function generateAsporto(count: number) : Promise<string>
{
    const idClienti: number[] = [];
    const asportiPromises: Promise<any>[] = [];

    try{
        const clienti = await cliente.findAll();
        clienti.forEach((c: ClienteRecord) => {
            idClienti.push(c.numero_carta);
        });
    } catch (err) {
        console.log("🔫 Non sono riuscito a trovare i clienti!");
        throw(err);
    }

    for (let i = 0; i < count; i++) {
        const indirizzo = faker.location.street() + " " + faker.location.secondaryAddress();
        const data_ora_consegna = faker.date.anytime().toISOString();
        const ref_cliente = faker.helpers.arrayElement(idClienti);

        const asportoPromise = asporto.create({
            indirizzo,
            data_ora_consegna,
            ref_cliente
        }).then(() => {
            console.log(`🏍️  Abbiamo consegnato d'asporto in via ${indirizzo} ed in data ${data_ora_consegna}!`);
        }).catch((err: any) => {
            console.error(`🔫 In via ${indirizzo} abita un pazzo, quindi non abbiamo consegnato d'asporto! Causa di spavento: ${err}`);
            throw err;
        });  

        asportiPromises.push(asportoPromise);
    }

    // Usiamo promise all per assicurarci che tutti gli asporti siano stati creati!
    try {
        await Promise.all(asportiPromises);
    } catch (err) {
        throw new Error(`Errore nella creazione degli asporti: ${err}`);
    }

    return "Asporti generati con successo!";
}