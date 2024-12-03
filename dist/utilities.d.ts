import { Response } from 'express';
import { Options } from "es-node-firebird";
export declare enum StatusCode {
    Ok = 0,
    Warning = 1,
    Error = 2
}
export declare class DateUtilities {
    /**
     * Pads a number with leading zeros to reach a specified length.
     * @param num - The number to pad.
     * @param totalLength - The total length of the resulting string.
     * @returns The padded string.
     */
    static addStartingZeros(num: number, totalLength: number): string;
    /**
     * Formats a Date object as a Moncler-style string.
     * @param dData - The date to format.
     * @param bAddMs - Whether to include milliseconds.
     * @returns The formatted date string.
     */
    static dateToMoncler(dData: Date, bAddMs?: boolean): string;
    /**
     * Formats a Date object as a SQL-style string.
     * @param dData - The date to format.
     * @param bAddMs - Whether to include milliseconds.
     * @returns The formatted date string.
     */
    static dateToSql(dData: Date, bAddMs?: boolean): string;
    /**
     * Formats a Date object as a simple string (dd-MM-yyyy).
     * @param dData - The date to format.
     * @returns The formatted date string.
     */
    static dateToSimple(dData: Date): string;
    /**
     * Gets the current date and time as a formatted string.
     * @returns The current date and time in the format dd.MM.yyyy HH:mm:ss.
     */
    static getNowDateString(): string;
    /**
     * Parses a date string in the format dd/MM/yyyy into a Date object.
     * @param date - The date string to parse.
     * @returns A Date object.
     */
    static parseDate(date: string): Date;
}
export declare class RestUtilities {
    /**
     * Sends an OK message as a response.
     * @param res - Express Response object.
     * @param message - The success message.
     * @returns The Response object.
     */
    static sendOKMessage(res: Response, message: string): Response;
    /**
     * Sends an error message as a response.
     * @param res - Express Response object.
     * @param error - The error to send.
     * @param tag - Optional tag for additional context.
     * @param status - HTTP status code (default: 500).
     * @returns The Response object.
     */
    static sendErrorMessage(res: Response, error: any, tag?: string, status?: number): Response;
    /**
     * Sends a base response with a payload.
     * @param res - Express Response object.
     * @param payload - The payload to include in the response.
     * @returns The Response object.
     */
    static sendBaseResponse(res: Response, payload: any): Response;
    /**
     * Sends an execution message as a response.
     * @param res - Express Response object.
     * @param executionObject - The execution data.
     * @param title - The title of the response.
     * @returns The Response object.
     */
    static sendExecMessage(res: Response, executionObject: any, title: string): Response;
    /**
     * Prints a SQL query with parameters replaced.
     * @param query - The SQL query.
     * @param params - The parameters to replace.
     * @returns The formatted query.
     */
    static printQueryWithParams(query: string, params: any[]): string;
}
/**
 * Utility class for managing database-related configurations and operations.
 */
export declare class DatabaseUtilities {
    /**
     * Creates a configuration object for connecting to a Firebird database.
     *
     * @param {string} host - The hostname or IP address of the database server.
     * @param {number} port - The port number on which the database server is running.
     * @param {string} database - The path or alias of the database to connect to.
     * @param {string} [username='SYSDBA'] - The username for authentication. Defaults to 'SYSDBA'.
     * @param {string} [password='masterkey'] - The password for authentication. Defaults to 'masterkey'.
     * @returns {Options} - The configuration object to use for establishing a Firebird database connection.
     *
     * @example
     * ```typescript
     * const options = DatabaseUtilities.createOption(
     *   'localhost',
     *   3050,
     *   '/path/to/database.fdb',
     *   'myUsername',
     *   'myPassword'
     * );
     * ```
     */
    static createOption(host: string, port: number, database: string, username?: string, password?: string): Options;
}
