# Accessi Module

Modulo NestJS per la gestione degli accessi, autenticazione e autorizzazione degli utenti.

## Configurazione

### File .env
Aggiungere al file `.env` del progetto i seguenti parametri:

```env
# Database Accessi
DB_DATABASE_ACCESSI=percorso_al_db
DB_USERNAME_ACCESSI=SYSDBA
DB_PASSWORD_ACCESSI=xxx
DB_HOST_ACCESSI=xxx.xxx.x.xxx
DB_PORT_ACCESSI=3050

# Email Configuration
MAIL_USER=form@emilsoftware.it
MAIL_PASSWORD=your-password
MAIL_FROM=noreply@emilsoftware.it
MAIL_HOST=smtp.qboxmail.com
MAIL_PORT=465
MAIL_SECURE=true

# Accessi Configuration
ACC_CONFIRMATION_EMAIL_URL=https://mio.sito.it/esgestx
ACC_CONFIRMATION_RETURN_EMAIL_URL=https://mio.sito.it/esgestx/login
ACC_ENCRYPTION_KEY=your-encryption-key
ACC_MOCK_DEMO_USER=true
ACC_JWT_EXPIRES=24h
ACC_JWT_SECRET=your-secret-key
```

Come parametri opzionali ci sono:
```env
ACC_PASSWORD_EXPIRATION = true | false //se non c'è di default è false
```
