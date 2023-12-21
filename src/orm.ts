// @ts-ignore
import * as Firebird from "es-node-firebird";
import {Logger} from "./logger";

export class Orm {
    public static RESULT_EXEC_OK: string = "ok!";

    public static quote(value: string): string {
        return "\"" + value + "\"";
    };

    public static testConnection(options: any): Promise<any> {
        const logger: Logger = new Logger(__filename);
        return new Promise((resolve): void => {
            Firebird.attach(options, (err: any, db: any): void => {
                if (err) {
                    logger.error("La connessione con il DATABASE non è andata a buon fine.");
                    return resolve(false);
                }
                logger.info("DATABASE connesso.");
                return resolve(true);
            })
        })
    }


    public static query(options: any, query: any, parameters: any[] = []): Promise<any> {
        return new Promise((resolve, reject): void => {
            Firebird.attach(options, (err: any, db: {
                query: (arg0: any, arg1: any[], arg2: (err: any, result: any) => void) => void; detach: () => void;
            }) => {
                if (err) {
                    return reject(err);
                }
                db.query(query, parameters, (error: any, result: any) => {
                    if (error) {
                        db.detach();
                        return reject(error);
                    }
                    db.detach();
                    return resolve(result);
                });
            });
        });
    }


    public static execute(options: any, query: any, parameters: any = []): Promise<any> {
        return new Promise((resolve, reject): void => {
            Firebird.attach(options, (err: any, db: {
                execute: (arg0: any, arg1: any, arg2: (error: any, result: any) => void) => void; detach: () => void;
            }) => {
                if (err) {
                    return reject(err);
                }

                db.execute(query, parameters, (error, result) => {
                    if (error) {
                        db.detach();
                        return reject(error);
                    }
                    db.detach();
                    return resolve(result);
                });
            });
        });
    }

    public static trimParam(param: any) {
        if (typeof param === "string" || param instanceof String) {
            return param.trim();
        }
        return param;
    }

    public static connect(options: any): Promise<any> {
        return new Promise((resolve, reject): void => {
            Firebird.attach(options, function (err: any, db: any): void {
                if (err) return reject(err); else return resolve(db);
            });
        });
    }

    public static startTransaction(db: any): Promise<any> {
        return new Promise((resolve, reject): void => {
            db.transaction(Firebird.ISOLATION_READ_COMMITTED, function (err: any, transaction: any) {
                if (err) return reject(err); else return resolve(transaction);
            });
        });
    }

    public static executeQueries(transaction: any, queries: any, params: any) {
        return queries.reduce((promiseChain: any, currentQuery: any, index: any) => {
            return promiseChain.then(() => new Promise((resolve, reject): void => {
                transaction.query(currentQuery, params[index], (err: any, result: any): void => {
                    if (err) return reject(err); else return resolve(result);
                });
            }));
        }, Promise.resolve());
    }

    public static commitTransaction(transaction: any): Promise<any> {
        return new Promise((resolve, reject): void => {
            transaction.commit((err: any) => {
                if (err) return reject(err); else return resolve('Transaction committed successfully.');
            });
        });
    }


}


