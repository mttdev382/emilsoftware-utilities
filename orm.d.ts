import { Database, Options, Transaction } from "node-firebird";
interface Orm {
    quote: (value: string) => string;
    testConnection: (options: Options) => Promise<any>;
    query: (options: Options, query: any, parameters?: any[]) => Promise<any>;
    execute: (options: Options, query: any, parameters?: any[]) => Promise<any>;
    trimParam: (param: any) => string;
    connect: (options: Options) => Promise<any>;
    startTransaction: (db: Database) => Promise<any>;
    executeQueries: (transaction: Transaction, queries: string[], params: any[]) => any;
    commitTransaction: (transaction: Transaction) => Promise<any>;
    rollbackTransaction: (transaction: Transaction) => Promise<any>;
}
export declare const Orm: Orm;
export {};
