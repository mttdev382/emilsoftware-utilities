import { Response } from 'express';
interface Utilities {
    parseDate: (date: string) => Date;
    printQueryWithParams: (query: string, params: any[]) => string;
    sendOKMessage: (res: Response, message: string) => Response;
    sendExecMessage: (res: Response, executionObject: any, title: string) => Response;
    getNowDateString: () => {};
    sendErrorMessage: (res: Response, error: any, tag?: string, status?: number) => Response;
    sendBaseResponse: (res: Response, payload: any) => Response;
    toCamel: (s: any) => any;
    isArray: (a: any) => boolean;
    isObject: (o: any) => boolean;
    keysToCamel: (o: any) => any;
    addStartingZeros: (num: number, totalLength: number) => string;
    dateToMoncler: (dData: Date, bAddMs?: boolean) => string;
    dateToSql: (dData: Date, bAddMs?: boolean) => string;
    dateToSimple: (dData: Date) => string;
}
export declare const Utilities: Utilities;
export {};
