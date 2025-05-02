import express from 'express';
import { initializeAllegatiModule } from "../../allegati-module";

async function main() {
    const app = express();

    await initializeAllegatiModule(app, {
        databaseOptions: {
            host: 'localhost',
            port: 3050,
            database: 'ALLEGATI_2_5.gdb',
            user: 'SYSDBA',
            password: 'masterkey',
        },
        attachmentTypes: [{
            id: 1,
            desc: 'Documento'
        }],
        codes: [{
            id: 'DEFAULT',
            desc: 'Codice di default'
        }],
        references: [{
            tipRif: 'TIPO',
            tabRif: 'TABELLA',
            desRif: 'DESCRIZIONE'
        }]
    });

    const PORT = 3000;
    app.listen(PORT, () => {
        console.log(`Test app for AllegatiModule running on http://localhost:${PORT}`);
    });

    return new Promise(() => {});
}

main();