import { Response } from 'express';

enum STATUS_CODE {
    OK = 0,
    WARNING = 1,
    ERROR = 2,
}

export class DateUtilities {
    /**
     * Pads a number with leading zeros to reach a specified length.
     * @param num - The number to pad.
     * @param totalLength - The total length of the resulting string.
     * @returns The padded string.
     */
    static addStartingZeros(num: number, totalLength: number): string {
        return String(num).padStart(totalLength, '0');
    }

    /**
     * Formats a Date object as a Moncler-style string.
     * @param dData - The date to format.
     * @param bAddMs - Whether to include milliseconds.
     * @returns The formatted date string.
     */
    static dateToMoncler(dData: Date, bAddMs: boolean = false): string {
        const yy = dData.getFullYear();
        const mm = this.addStartingZeros(dData.getMonth() + 1, 2);
        const dd = this.addStartingZeros(dData.getDate(), 2);
        const hh = this.addStartingZeros(dData.getHours(), 2);
        const nn = this.addStartingZeros(dData.getMinutes(), 2);
        const ss = this.addStartingZeros(dData.getSeconds(), 2);
        const ms = this.addStartingZeros(dData.getMilliseconds(), 3);
        return bAddMs ? `${yy}${mm}${dd}${hh}${nn}${ss}${ms}` : `${yy}${mm}${dd}${hh}${nn}${ss}`;
    }

    /**
     * Formats a Date object as a SQL-style string.
     * @param dData - The date to format.
     * @param bAddMs - Whether to include milliseconds.
     * @returns The formatted date string.
     */
    static dateToSql(dData: Date, bAddMs: boolean = false): string {
        const yy = dData.getFullYear();
        const mm = this.addStartingZeros(dData.getMonth() + 1, 2);
        const dd = this.addStartingZeros(dData.getDate(), 2);
        const hh = this.addStartingZeros(dData.getHours(), 2);
        const nn = this.addStartingZeros(dData.getMinutes(), 2);
        const ss = this.addStartingZeros(dData.getSeconds(), 2);
        const ms = this.addStartingZeros(dData.getMilliseconds(), 3);
        return bAddMs
            ? `${yy}-${mm}-${dd} ${hh}:${nn}:${ss}.${ms}`
            : `${yy}-${mm}-${dd} ${hh}:${nn}:${ss}`;
    }

    /**
     * Formats a Date object as a simple string (dd-MM-yyyy).
     * @param dData - The date to format.
     * @returns The formatted date string.
     */
    static dateToSimple(dData: Date): string {
        const yy = dData.getFullYear();
        const mm = this.addStartingZeros(dData.getMonth() + 1, 2);
        const dd = this.addStartingZeros(dData.getDate(), 2);
        return `${dd}-${mm}-${yy}`;
    }

    /**
     * Gets the current date and time as a formatted string.
     * @returns The current date and time in the format dd.MM.yyyy HH:mm:ss.
     */
    static getNowDateString(): string {
        const now: Date = new Date();
        const day = now.getDate().toString().padStart(2, "0");
        const month = (now.getMonth() + 1).toString().padStart(2, "0");
        const year = now.getFullYear();
        const hours = now.getHours().toString().padStart(2, "0");
        const minutes = now.getMinutes().toString().padStart(2, "0");
        const seconds = now.getSeconds().toString().padStart(2, "0");
        return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
    }

    /**
     * Parses a date string in the format dd/MM/yyyy into a Date object.
     * @param date - The date string to parse.
     * @returns A Date object.
     */
    static parseDate(date: string): Date {
        const parts: string[] = date.split("/");
        return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    }
}


export class RestUtilities {
    /**
     * Sends an OK message as a response.
     * @param res - Express Response object.
     * @param message - The success message.
     * @returns The Response object.
     */
    static sendOKMessage(res: Response, message: string): Response {
        return res.send({
            severity: "success",
            status: 200,
            statusCode: STATUS_CODE.OK,
            message,
        });
    }

    /**
     * Sends an error message as a response.
     * @param res - Express Response object.
     * @param error - The error to send.
     * @param tag - Optional tag for additional context.
     * @param status - HTTP status code (default: 500).
     * @returns The Response object.
     */
    static sendErrorMessage(res: Response, error: any, tag: string = "[BASE ERROR]", status: number = 500): Response {
        return res.status(status).send({
            severity: "error",
            status,
            statusCode: STATUS_CODE.ERROR,
            message: "An error occurred",
            error: `${tag}: ${error}`,
        });
    }

    /**
     * Sends a base response with a payload.
     * @param res - Express Response object.
     * @param payload - The payload to include in the response.
     * @returns The Response object.
     */
    static sendBaseResponse(res: Response, payload: any): Response {
        try {
            payload = JSON.parse(JSON.stringify(payload));
            const response = {
                Status: {
                    errorCode: "0",
                    errorDescription: "",
                },
                Result: payload,
                Message: "",
            };
            return res.send(response);
        } catch (error) {
            return this.sendErrorMessage(res, `Error sending response: ${error}`, "[UTILITIES]", 500);
        }
    }

    /**
     * Sends an execution message as a response.
     * @param res - Express Response object.
     * @param executionObject - The execution data.
     * @param title - The title of the response.
     * @returns The Response object.
     */
    static sendExecMessage(res: Response, executionObject: any, title: string): Response {
        try {
            const response = {
                Status: {
                    errorCode: "0",
                    errorDescription: "",
                },
                Sql: "",
                ID: executionObject?.id,
                data: executionObject,
                Title: title,
            };
            return res.send(response);
        } catch (error) {
            return this.sendErrorMessage(res, `Error sending execution message: ${error}`, title, 500);
        }
    }

    /**
     * Prints a SQL query with parameters replaced.
     * @param query - The SQL query.
     * @param params - The parameters to replace.
     * @returns The formatted query.
     */
    static printQueryWithParams(query: string = "", params: any[]): string {
        try {
            params.forEach(param => {
                query = query.replace("?", param);
            });
            return query;
        } catch (error) {
            throw error;
        }
    }
}
