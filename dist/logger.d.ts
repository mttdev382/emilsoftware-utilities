export declare enum LogLevels {
    INFO = "INFO",
    ERROR = "ERROR",
    DEBUG = "DEBUG",
    LOG = "LOG",
    DATABASE = "DATABASE"
}
export declare class Logger {
    private readonly winstonLogger;
    private readonly tag;
    private logFormat;
    private replaceAll;
    constructor(tag: string);
    private getFileName;
    execStart(prefix?: string): number;
    execStop(prefix: string, startTime: number, error?: boolean): void;
    info(...data: Object[]): void;
    dbLog(...data: Object[]): void;
    debug(...data: Object[]): void;
    log(...data: Object[]): void;
    error(...data: Object[]): void;
    private test;
    private print;
}
