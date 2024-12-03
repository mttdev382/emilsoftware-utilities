import winston from "winston";
export declare enum LogLevels {
    INFO = "INFO",
    ERROR = "ERROR",
    WARNING = "WARNING",
    DEBUG = "DEBUG",
    LOG = "LOG",
    DATABASE = "DATABASE"
}
export declare class Logger {
    private readonly winstonLogger;
    private readonly tag;
    private readonly logDirectory;
    private logFormat;
    constructor(tag: string, config?: {
        logDirectory?: string;
        customFormat?: winston.Logform.Format;
        transports?: winston.transport[];
    });
    private initializeDirectory;
    private getFileName;
    private replaceAll;
    execStart(prefix?: string): number;
    execStop(prefix: string, startTime: number, error?: boolean): void;
    info(...data: Object[]): void;
    dbLog(...data: Object[]): void;
    debug(...data: Object[]): void;
    warning(...data: Object[]): void;
    log(...data: Object[]): void;
    error(...data: Object[]): void;
    private print;
    static createLogger(tag: string, config?: {
        logDirectory?: string;
    }): Logger;
}
