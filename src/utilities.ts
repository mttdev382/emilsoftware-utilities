import {Logger} from "./logger";

export class Utilities {

    public static parseDate(date: string): Date {
        const parts: string[] = date.split("/");
        return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    }

    public static STATUS_CODE = {
        OK: 0, WARNING: 1, ERROR: 2,
    };

    public static sendOKMessage(res: any, message: any) {
        return res.send({
            severity: "success", status: 200, statusCode: this.STATUS_CODE.OK, message,
        });
    }

    public static getNowDateString(): string {
        const now: Date = new Date();
        const day: string | number = now.getDate() < 9 ? "0" + now.getDate() : now.getDate();
        const month: string | number = (now.getMonth() + 1) < 9 ? "0" + (now.getMonth() + 1) : (now.getMonth() + 1);
        const year: number = now.getFullYear();
        const hours: string | number = now.getHours() < 9 ? "0" + now.getHours() : now.getHours();
        const minutes: string | number = now.getMinutes() < 9 ? "0" + now.getMinutes() : now.getMinutes();
        const seconds: string | number = now.getSeconds() < 9 ? "0" + now.getSeconds() : now.getSeconds();
        return day + "." + month + "." + year + " " + hours + ":" + minutes + ":" + seconds;
    }


    public static sendErrorMessage(res: any, err: any, tag: string = "[BASE ERROR]", status: number = 500) {
        return res.status(status).send({
            severity: "error",
            status: 500,
            statusCode: this.STATUS_CODE.ERROR,
            message: " Si è verificato un errore",
            error: tag + ": " + err,
        });
    }

    private static toCamel(s: any) {
        return s.replace(/([-_][a-z])/gi, ($1: string) => {
            return $1.toUpperCase().replace("-", "").replace("_", "");
        });
    };

    private static isArray(a: any) {
        return Array.isArray(a);
    };

    private static isObject(o: any) {
        return o === Object(o) && !this.isArray(o) && typeof o !== "function";
    };

    public static keysToCamel(o: any) {
        if (this.isObject(o)) {
            const n = {};

            Object.keys(o).forEach((k: any) => {
                // @ts-ignore
                n[this.toCamel(k)] = this.keysToCamel(o[k]);
            });
            return n;
        } else if (this.isArray(o)) {
            return o.map((i: any) => {
                return this.keysToCamel(i);
            });
        }

        return o;
    };

    public static addStartingZeros(num: number, totalLength: number): string {
        return String(num).padStart(totalLength, '0');
    }

    public static dateToMoncler(dData: Date, bAddMs: boolean = false): string {
        const yy: number = dData.getFullYear();
        const mm: string = this.addStartingZeros(dData.getMonth() + 1, 2);
        const dd: string = this.addStartingZeros(dData.getDate(), 2);
        const hh: string = this.addStartingZeros(dData.getHours(), 2);
        const nn: string = this.addStartingZeros(dData.getMinutes(), 2);
        const ss: string = this.addStartingZeros(dData.getSeconds(), 2);
        const ms: string = this.addStartingZeros(dData.getMilliseconds(), 3);
        if (bAddMs) {
            return yy + mm + dd + hh + nn + ss + ms;
        } else {
            return yy + mm + dd + hh + nn + ss;
        }
    }

    public static dateToSql(dData: Date, bAddMs: boolean = false): string {
        const yy: number = dData.getFullYear();
        const mm: string = this.addStartingZeros(dData.getMonth() + 1, 2);
        const dd: string = this.addStartingZeros(dData.getDate(), 2);
        const hh: string = this.addStartingZeros(dData.getHours(), 2);
        const nn: string = this.addStartingZeros(dData.getMinutes(), 2);
        const ss: string = this.addStartingZeros(dData.getSeconds(), 2);
        const ms: string = this.addStartingZeros(dData.getMilliseconds(), 3);
        if (bAddMs) {
            return yy + '-' + mm + '-' + dd + ' ' + hh + ':' + nn + ':' + ss + '.' + ms;
        } else {
            return yy + '-' + mm + '-' + dd + ' ' + hh + ':' + nn + ':' + ss;

        }
    }

    public static dateToSimple(dData: Date): string {
        const yy: number = dData.getFullYear();
        const mm: string = this.addStartingZeros(dData.getMonth() + 1, 2);
        const dd: string = this.addStartingZeros(dData.getDate(), 2);
        return dd + '-' + mm + '-' + yy;
    }


}

