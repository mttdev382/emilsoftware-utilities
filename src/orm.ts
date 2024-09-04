// @ts-ignore
import * as Firebird from "es-node-firebird";
import { Logger } from "./logger";
import { Database, Options, Transaction } from "es-node-firebird";
import { Utilities } from "./utilities";

const logger: Logger = new Logger(__filename);

const quote = (value: string): string => {
    return "\"" + value + "\"";
};
const testConnection = (options: Options): Promise<any> => {
    return new Promise((resolve): void => {
        Firebird.attach(options, (err: Error, db: Database): void => {
            if (err) {
                logger.error('La connessione con il DATABASE non è andata a buon fine.');
                return resolve(false);
            }
            logger.info("DATABASE connesso.");
            if (db) db.detach();
            return resolve(true);
        })
    })
}

const query = (options: Options, query: string, parameters: any[] = []): Promise<any> => {
    try {
        return new Promise((resolve, reject): void => {
            Firebird.attach(options, (err: any, db: Database) => {
                if (err) {
                    logger.error(err);
                    return reject(err);
                }

                logger.info(Utilities.printQueryWithParams(query, parameters));
                db.query(query, parameters, (error: any, result: any) => {
                    if (error) {
                        logger.error(error);
                        db.detach();
                        return reject(error);
                    }
                    db.detach();
                    return resolve(result);
                });
            });
        });
    } catch (error) {
        logger.error(error);
        throw error;
    }
}
const execute = (options: Options, query: string, parameters: any = []): Promise<any> => {
    try {
        return new Promise((resolve, reject): void => {
            Firebird.attach(options, (err: any, db: Database) => {
                if (err) {
                    logger.error(err);
                    return reject(err);
                }

                logger.info(Utilities.printQueryWithParams(query, parameters));
                db.execute(query, parameters, (error, result: any): void => {
                    if (error) {
                        logger.error(error);
                        db.detach();
                        return reject(error);
                    }
                    db.detach();
                    return resolve(result);
                });
            });
        });
    } catch (error) {
        logger.error(error);
        throw error;
    }
}

const trimParam = (param: any): string => {
    if (typeof param === "string" || param instanceof String) {
        return param.trim();
    }
    return param;
}

const connect = (options: Options): Promise<any> => {
    return new Promise((resolve, reject): void => {
        Firebird.attach(options, function (err: any, db: any): void {
            if (err) return reject(err); else return resolve(db);
        });
    });
}

const startTransaction = (db: Database): Promise<any> => {
    return new Promise((resolve, reject): void => {
        db.transaction(Firebird.ISOLATION_READ_COMMITTED, function (err: any, transaction: any) {
            if (err) return reject(err); else return resolve(transaction);
        });
    });
}

const commitTransaction = (transaction: Transaction): Promise<any> => {
    return new Promise((resolve, reject): void => {
        transaction.commit((err: any): void => {
            if (err) return reject(err); else return resolve('Transaction committed successfully.');
        });
    });
}

const rollbackTransaction = (transaction: Transaction): Promise<any> => {
    return new Promise((resolve, reject) => {
        transaction.rollback(err => {
            if (err) return reject(err);
            else return resolve('Transaction rolled back successfully.');
        });
    });
}

interface QueryWithParams {
    query: string,
    params: any[]
}

const executeMultiple = async (options: Options, queriesWithParams: QueryWithParams[]): Promise<any> => {
    let db: Database;
    let transaction: Transaction;

    try {
        // Connetti al database
        db = await connect(options);

        // Inizia la transazione
        transaction = await startTransaction(db);

        // Esegui le query in serie
        for (const qwp of queriesWithParams) {
            await new Promise((resolve, reject) => {
                transaction.query(qwp.query, qwp.params, (err: any, result: any): void => {
                    if (err) return reject(err);
                    else return resolve(result);
                });
            });
        }

        // Commit della transazione
        await commitTransaction(transaction);

        // Stacca il database
        db.detach();

        // Ritorna il messaggio di successo
        return 'OK';

    } catch (error) {
        // In caso di errore, fai rollback della transazione
        if (transaction) {
            await rollbackTransaction(transaction);
        }
        if (db) {
            db.detach();
        }
        throw error;
    }
};

const executeQueries = async (transaction: Transaction, queries: string[], params: any[]): Promise<any> => {
    try {
        try {
            return await queries.reduce((promiseChain: Promise<any>, currentQuery: string, index: number) => {
                return promiseChain.then(() => new Promise((resolve, reject) => {
                    transaction.query(currentQuery, params[index], (err: any, result: any): void => {
                        if (err) return reject(err);
                        else return resolve(result);
                    });
                }));
            }, Promise.resolve());
        } catch (error) {
            return await new Promise((resolve_1, reject_1) => {
                transaction.rollback((rollbackErr: any) => {
                    if (rollbackErr) {
                        return reject_1(rollbackErr);
                    } else {
                        return reject_1(error);
                    }
                });
            });
        }
    } catch (error) {
        throw error;
    }
};

interface Orm {
    quote: (value: string) => string,
    testConnection: (options: Options) => Promise<any>,
    query: (options: Options, query: any, parameters?: any[]) => Promise<any>,
    execute: (options: Options, query: any, parameters?: any[]) => Promise<any>,
    trimParam: (param: any) => string,
    connect: (options: Options) => Promise<any>,
    startTransaction: (db: Database) => Promise<any>,
    executeMultiple: (options: Options, qwps: QueryWithParams[]) => any,
    executeQueries: (transaction: Transaction, queries: string[], params: any[]) => any,
    commitTransaction: (transaction: Transaction) => Promise<any>,
    rollbackTransaction: (transaction: Transaction) => Promise<any>,
}

export const Orm: Orm = {
    quote,
    testConnection,
    query,
    execute,
    trimParam,
    connect,
    startTransaction,
    executeQueries,
    executeMultiple,
    commitTransaction,
    rollbackTransaction
}


