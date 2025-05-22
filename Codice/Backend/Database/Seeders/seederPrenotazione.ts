import prenotazione from '../../Models/prenotazione';
import torretta from '../../Models/torretta';
import cliente from '../../Models/cliente';

import { faker } from '@faker-js/faker';

export async function generatePrenotazione(count: number): Promise<string> {
    try {

        const torrette = await torretta.findAll();
        const idTorrette = torrette.map(t => t.id_torretta);

        const clienti = await cliente.findAll();
        const idClienti = clienti.map(c => c.numero_carta);

        for (let i = 0; i < count; i++) {
            let numero_persone = faker.number.int({ min: 1, max: 8 });
            let ref_cliente = faker.number.int({ min: 0, max: 1 }) == 0 ? faker.helpers.arrayElement(idClienti) : null;
            let ref_torretta = faker.helpers.arrayElement(idTorrette);
            let data_ora_prenotazione = faker.date.anytime().toISOString();
            let otp = faker.string.alphanumeric({ length: 6 });

            try {
                await prenotazione.create({ numero_persone: numero_persone, ref_cliente: ref_cliente, ref_torretta: ref_torretta, data_ora_prenotazione: data_ora_prenotazione, otp: otp });
                console.log(`📆  Aggiunta la prenotazione di ${numero_persone} persone giorno ${data_ora_prenotazione}. Gli è stata assegnata la torretta ${ref_torretta} ed è stata ${ref_cliente == null ? "creata in loco." : `creata online dall'utente ${ref_cliente}.`}`);
            } catch (err) {
                console.log(`❌ Impossibile aggiungere la prenotazione in giorno ${data_ora_prenotazione}. Motivo: ${err}`);
                throw err;
            }

        }

        return ("📆 Prenotazioni generate con successo");

    }
    catch (err) {
        console.error(`❌ Errore durante la generazione delle prenotazioni: ${err}`);
        throw err;
    }
}

export default generatePrenotazione;