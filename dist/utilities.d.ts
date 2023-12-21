export declare class Utilities {
    static parseDate(date: string): Date;
    static STATUS_CODE: {
        OK: number;
        WARNING: number;
        ERROR: number;
    };
    static sendOKMessage(res: any, message: any): any;
    static getNowDateString(): string;
    static sendErrorMessage(res: any, err: any, tag?: string, status?: number): any;
    static sendOpenResponse(res: any, payload: any): any;
    static sendOpenErrorMessage(res: any, err: any, tag?: string, status?: number): any;
    private static toCamel;
    private static isArray;
    private static isObject;
    static keysToCamel(o: any): any;
    static addStartingZeros(num: number, totalLength: number): string;
    static dateToMoncler(dData: Date, bAddMs?: boolean): string;
    static dateToSql(dData: Date, bAddMs?: boolean): string;
    static dateToSimple(dData: Date): string;
}
