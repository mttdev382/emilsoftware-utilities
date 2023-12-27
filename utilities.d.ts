interface Utilities {
    parseDate: (date: string) => Date;
    sendOKMessage: (res: any, message: any) => any;
    getNowDateString: () => {};
    sendErrorMessage: (res: any, err: any, tag?: string, status?: number) => any;
    sendBaseResponse: (res: any, payload: any) => any;
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
