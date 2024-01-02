import {Response} from 'express';


enum STATUS_CODE {
    OK = 0, WARNING = 1, ERROR = 2,
}

const parseDate = (date: string) => {
    const parts: string[] = date.split("/");
    return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
}

const sendOKMessage = (res: Response, message: string): Response => {
    return res.send({
        severity: "success", status: 200, statusCode: STATUS_CODE.OK, message,
    });
}


const getNowDateString = (): string => {
    const now: Date = new Date();
    const day: string | number = now.getDate() < 9 ? "0" + now.getDate() : now.getDate();
    const month: string | number = (now.getMonth() + 1) < 9 ? "0" + (now.getMonth() + 1) : (now.getMonth() + 1);
    const year: number = now.getFullYear();
    const hours: string | number = now.getHours() < 9 ? "0" + now.getHours() : now.getHours();
    const minutes: string | number = now.getMinutes() < 9 ? "0" + now.getMinutes() : now.getMinutes();
    const seconds: string | number = now.getSeconds() < 9 ? "0" + now.getSeconds() : now.getSeconds();
    return day + "." + month + "." + year + " " + hours + ":" + minutes + ":" + seconds;
}


const sendErrorMessage = (res: Response, error: any, tag: string = "[BASE ERROR]", status: number = 500): Response => {
    return res.status(status).send({
        severity: "error",
        status: 500,
        statusCode: STATUS_CODE.ERROR,
        message: " Si è verificato un errore",
        error: tag + ": " + error,
    });
}

const sendBaseResponse = (res: Response, payload: any): Response => {
    try {
        payload = JSON.parse(JSON.stringify(payload));
        const clearPayload = payload;           // this.keysToCamel(payload);
        const response = {
            Status: {
                errorCode: "0", errorDescription: "",
            }, Result: clearPayload, Message: ""
        };
        return res.send(response);
    } catch (error) {
        return sendErrorMessage(res, "Errore nell'invio della risposta: " + error, "[UTILITIES]", 500);
    }
}


const toCamel = (s: any) => {
    return s.replace(/([-_][a-z])/gi, ($1: string) => {
        return $1.toUpperCase().replace("-", "").replace("_", "");
    });
};

const isArray = (a: any): boolean => {
    return Array.isArray(a);
};

const isObject = (o: any): boolean => {
    return o === Object(o) && !isArray(o) && typeof o !== "function";
};


const keysToCamel = (o: any): any => {
    if (isObject(o)) {
        const n = {};

        Object.keys(o).forEach((k: any) => {
            // @ts-ignore
            n[toCamel(k)] = keysToCamel(o[k]);
        });
        return n;
    } else if (isArray(o)) {
        return o.map((i: any) => {
            return keysToCamel(i);
        });
    }

    return o;
};

const addStartingZeros = (num: number, totalLength: number): string => {
    return String(num).padStart(totalLength, '0');
}

const dateToMoncler = (dData: Date, bAddMs: boolean = false): string => {
    const yy: number = dData.getFullYear();
    const mm: string = addStartingZeros(dData.getMonth() + 1, 2);
    const dd: string = addStartingZeros(dData.getDate(), 2);
    const hh: string = addStartingZeros(dData.getHours(), 2);
    const nn: string = addStartingZeros(dData.getMinutes(), 2);
    const ss: string = addStartingZeros(dData.getSeconds(), 2);
    const ms: string = addStartingZeros(dData.getMilliseconds(), 3);
    if (bAddMs) {
        return yy + mm + dd + hh + nn + ss + ms;
    } else {
        return yy + mm + dd + hh + nn + ss;
    }
}

const dateToSql = (dData: Date, bAddMs: boolean = false): string => {
    const yy: number = dData.getFullYear();
    const mm: string = addStartingZeros(dData.getMonth() + 1, 2);
    const dd: string = addStartingZeros(dData.getDate(), 2);
    const hh: string = addStartingZeros(dData.getHours(), 2);
    const nn: string = addStartingZeros(dData.getMinutes(), 2);
    const ss: string = addStartingZeros(dData.getSeconds(), 2);
    const ms: string = addStartingZeros(dData.getMilliseconds(), 3);
    if (bAddMs) {
        return yy + '-' + mm + '-' + dd + ' ' + hh + ':' + nn + ':' + ss + '.' + ms;
    } else {
        return yy + '-' + mm + '-' + dd + ' ' + hh + ':' + nn + ':' + ss;

    }
}

const dateToSimple = (dData: Date): string => {
    const yy: number = dData.getFullYear();
    const mm: string = addStartingZeros(dData.getMonth() + 1, 2);
    const dd: string = addStartingZeros(dData.getDate(), 2);
    return dd + '-' + mm + '-' + yy;
}

const sendExecMessage = (res: Response, executionObject: any, title: string): Response => {
    try {
        let sSql = "";
        let response = {
            Status: {
                errorCode: "0", errorDescription: "",
            }, Sql: sSql, ID: executionObject?.id, Title: title
        };
        return res.send(response);
    } catch (error) {
        return sendErrorMessage(res, "Errore nell'invio della risposta: " + error, title, 500);
    }
}

const printQueryWithParams = (query: string = "", params: any[]): string => {
    try {
        params.forEach(param => {
            query = query.replace("?", param);
        });
        return query;
    } catch (error) {
        throw error;
    }
}


interface Utilities {
    parseDate: (date: string) => Date,
    printQueryWithParams: (query: string, params: any[]) => string,
    sendOKMessage: (res: Response, message: string) => Response,
    sendExecMessage: (res: Response, executionObject: any, title: string) => Response,
    getNowDateString: () => {},
    sendErrorMessage: (res: Response, error: any, tag?: string, status?: number) => Response,
    sendBaseResponse: (res: Response, payload: any) => Response,
    toCamel: (s: any) => any,
    isArray: (a: any) => boolean,
    isObject: (o: any) => boolean,
    keysToCamel: (o: any) => any,
    addStartingZeros: (num: number, totalLength: number) => string,
    dateToMoncler: (dData: Date, bAddMs?: boolean) => string,
    dateToSql: (dData: Date, bAddMs?: boolean) => string,
    dateToSimple: (dData: Date) => string
}

export const Utilities: Utilities = {
    parseDate,
    printQueryWithParams,
    sendOKMessage,
    sendExecMessage,
    getNowDateString,
    sendErrorMessage,
    sendBaseResponse,
    toCamel,
    isArray,
    isObject,
    keysToCamel,
    addStartingZeros,
    dateToMoncler,
    dateToSql,
    dateToSimple
}

