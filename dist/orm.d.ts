import { Database, Options, Transaction } from "es-node-firebird";
export declare class Orm {
    private static logger;
    static quote(value: string): string;
    static testConnection(options: Options): Promise<boolean>;
    static query(options: Options, query: string, parameters?: any[], logQuery?: boolean): Promise<any>;
    static execute(options: Options, query: string, parameters?: any, logQuery?: boolean): Promise<any>;
    static trimParam(param: any): string;
    static connect(options: Options): Promise<Database>;
    static startTransaction(db: Database): Promise<Transaction>;
    static commitTransaction(transaction: Transaction): Promise<string>;
    static rollbackTransaction(transaction: Transaction): Promise<string>;
    static executeMultiple(options: Options, queriesWithParams: {
        query: string;
        params: any[];
    }[]): Promise<string>;
    static executeQueries(transaction: Transaction, queries: string[], params: any[]): Promise<any>;
}
