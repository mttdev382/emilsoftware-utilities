import * as Firebird from "es-node-firebird";
import { Logger } from "./Logger";
import { Database, Options, Transaction } from "es-node-firebird";
import { RestUtilities } from "./Utilities";

export class Orm {
    private static logger: Logger = new Logger(Orm.name);

    public static quote(value: string): string {
        return "\"" + value + "\"";
    }

    public static async testConnection(options: Options): Promise<boolean> {
        return new Promise((resolve): void => {
            Firebird.attach(options, (err: Error, db: Database): void => {
                if (err) {
                    this.logger.error('La connessione con il DATABASE non è andata a buon fine.');
                    return resolve(false);
                }
                this.logger.info("DATABASE connesso.");
                if (db) db.detach();
                return resolve(true);
            });
        });
    }

    public static async query(options: Options, query: string, parameters: any[] = [], logQuery = true): Promise<any> {
        try {
            return new Promise((resolve, reject): void => {
                Firebird.attach(options, (err: any, db: Database) => {
                    if (err) {
                        this.logger.error(err);
                        return reject(err);
                    }

                    if(logQuery) this.logger.info(RestUtilities.printQueryWithParams(query, parameters));
                    db.query(query, parameters, (error: any, result: any) => {
                        if (error) {
                            this.logger.error(error);
                            db.detach();
                            return reject(error);
                        }
                        db.detach();
                        return resolve(result);
                    });
                });
            });
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }

    public static async execute(options: Options, query: string, parameters: any = [], logQuery = true): Promise<any> {
        try {
            return new Promise((resolve, reject): void => {
                Firebird.attach(options, (err: any, db: Database) => {
                    if (err) {
                        this.logger.error(err);
                        return reject(err);
                    }

                    if(logQuery) this.logger.info(RestUtilities.printQueryWithParams(query, parameters));
                    db.execute(query, parameters, (error: any, result: any) => {
                        if (error) {
                            this.logger.error(error);
                            db.detach();
                            return reject(error);
                        }
                        db.detach();
                        return resolve(result);
                    });
                });
            });
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }

    public static trimParam(param: any): string {
        if (typeof param === "string" || param instanceof String) {
            return param.trim();
        }
        return param;
    }

    public static async connect(options: Options): Promise<Database> {
        return new Promise((resolve, reject): void => {
            Firebird.attach(options, function (err: any, db: Database): void {
                if (err) return reject(err); else return resolve(db);
            });
        });
    }

    public static async startTransaction(db: Database): Promise<Transaction> {
        return new Promise((resolve, reject): void => {
            db.transaction(Firebird.ISOLATION_READ_COMMITTED, function (err: any, transaction: Transaction): void {
                if (err) return reject(err); else return resolve(transaction);
            });
        });
    }

    public static async commitTransaction(transaction: Transaction): Promise<string> {
        return new Promise((resolve, reject): void => {
            transaction.commit((err: any): void => {
                if (err) return reject(err); else return resolve('Transaction committed successfully.');
            });
        });
    }

    public static async rollbackTransaction(transaction: Transaction): Promise<string> {
        return new Promise((resolve, reject): void => {
            transaction.rollback((err: any): void => {
                if (err) return reject(err); else return resolve('Transaction rolled back successfully.');
            });
        });
    }

    public static async executeMultiple(options: Options, queriesWithParams: { query: string, params: any[] }[]): Promise<string> {
        let db: Database | undefined;
        let transaction: Transaction | undefined;

        try {
            db = await Orm.connect(options);
            transaction = await Orm.startTransaction(db);

            for (const qwp of queriesWithParams) {
                await new Promise((resolve, reject) => {
                    transaction.query(qwp.query, qwp.params, (err: any, result: any): void => {
                        if (err) return reject(err);
                        else return resolve(result);
                    });
                });
            }

            await Orm.commitTransaction(transaction);
            db.detach();
            return 'OK';

        } catch (error) {
            if (transaction) {
                await Orm.rollbackTransaction(transaction);
            }
            if (db) {
                db.detach();
            }
            throw error;
        }
    }

    public static async executeQueries(transaction: Transaction, queries: string[], params: any[]): Promise<any> {
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
            return await new Promise((resolve, reject) => {
                transaction.rollback((rollbackErr: any): void => {
                    if (rollbackErr) {
                        return reject(rollbackErr);
                    } else {
                        return reject(error);
                    }
                });
            });
        }
    }
}
