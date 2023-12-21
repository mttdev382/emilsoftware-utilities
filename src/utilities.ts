export class Utilities {

    public static parseDate(date: string) {
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

    public static getNowDateString() {
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
        // tslint:disable-next-line:no-console
        console.error(err);
        return res.status(status).send({
            severity: "error",
            status: 500,
            statusCode: this.STATUS_CODE.ERROR,
            message: " Si è verificato un errore",
            error: tag + ": " + err,
        });
    }

    // Risposte per funzioni in stile ES
    public static sendOpenResponse(res: any, payload: any) {
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
            return this.sendOpenErrorMessage(res, "Errore nell'invio della risposta: " + error, "[UTILITIES]", 500);
        }
    }


    public static sendOpenErrorMessage(res: any, err: any, tag = "[BASE ERROR]", status = 500) {
        return res.status(status).send({
            Status: {
                errorCode: "500", errorDescription: err,
            }, Result: [], Message: err,
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

    public static addStartingZeros(num: number, totalLength: number) {
        return String(num).padStart(totalLength, '0');
    }

    public static dateToMoncler(dData: Date, bAddMs: boolean = false) {
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

    public static dateToSql(dData: Date, bAddMs: boolean = false) {
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

    public static dateToSimple(dData: Date) {
        const yy: number = dData.getFullYear();
        const mm: string = this.addStartingZeros(dData.getMonth() + 1, 2);
        const dd: string = this.addStartingZeros(dData.getDate(), 2);
        return dd + '-' + mm + '-' + yy;
    }


}

