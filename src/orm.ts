// @ts-ignore
import * as Firebird from "es-node-firebird";
import {Logger} from "./logger";

export class Orm {
    public static RESULT_EXEC_OK = "ok!";

    public static quote(value: string) {
        return "\"" + value + "\"";
    };

    public static testConnection(options: any): Promise<any> {
        const logger: Logger = new Logger(__filename);
        return new Promise((resolve, reject): void => {
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


    public static execute(options: any, query: any, parameters: any = []) {
        return new Promise((resolve, reject) => {
            Firebird.attach(options, (err: any, db: {
                execute: (arg0: any, arg1: any, arg2: (error: any, result: any) => void) => void; detach: () => void;
            }) => {
                if (err) {
                    // tslint:disable-next-line:no-console
                    console.error(err);
                    return reject(err);
                }

                db.execute(query, parameters, (error, result) => {
                    if (error) {
                        db.detach();
                        // tslint:disable-next-line:no-console
                        console.log(query);
                        parameters.forEach((param: any, i: any) => {
                            // tslint:disable-next-line:no-console
                            console.log(i + 1, param);
                        })
                        // tslint:disable-next-line:no-console
                        console.error(error);
                        return reject(error);
                    }
                    db.detach();
                    return resolve(this.RESULT_EXEC_OK);
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
}


