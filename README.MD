 1. feat: → nuova feature
Esempio: feat: aggiunta endpoint per notifiche

Triggera: MINOR release (1.3.0 → 1.4.0)

Su dev → 1.4.0-dev.0

2. fix: → correzione di bug
Esempio: fix: gestione errore null in login

Triggera: PATCH release (1.3.1)

Su dev → 1.3.1-dev.0

3. BREAKING CHANGE: (in descrizione o ! nel tipo)
Esempio:
```
bash
feat!: rimozione supporto legacy
```

BREAKING CHANGE: cambia lo schema JWT
Triggera: MAJOR release (1.0.0 → 2.0.0)

4. chore:, docs:, test:, refactor: ecc.
Esempio: chore: aggiorna dipendenze

Non triggerano release di default, a meno che tu non configuri esplicitamente nel commit-analyzer.

5. FORZA UNA RELEASE (utile in caso di merge ecc.): 
- git commit --allow-empty -m "feat: trigger test release"
- git push origin dev OPPURE git push origin main
