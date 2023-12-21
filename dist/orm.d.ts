export declare class Orm {
    static RESULT_EXEC_OK: string;
    static quote(value: string): string;
    static testConnection(options: any): Promise<any>;
    static query(options: any, query: any, parameters?: any[]): Promise<any>;
    static execute(options: any, query: any, parameters?: any): Promise<unknown>;
    static trimParam(param: any): any;
}
