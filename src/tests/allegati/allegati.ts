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
    });

    const PORT = 3000; // Usa una sola porta
    app.listen(PORT, () => {
        console.log(`Test app for AllegatiModule running on http://localhost:${PORT}`);
    });

    return new Promise(() => {}); // <-- blocca il main in attesa infinita
}

main();