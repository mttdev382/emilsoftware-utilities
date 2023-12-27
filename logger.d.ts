export declare enum LogLevels {
    INFO = "INFO",
    ERROR = "ERROR",
    DEBUG = "DEBUG",
    LOG = "LOG"
}
export declare class Logger {
    private readonly winstonLogger;
    tag: string;
    private logFormat;
    constructor(tag: string);
    private getFileName;
    execStart(prefix?: string): any;
    execStop(prefix: string, startTime: any, error?: boolean): any;
    info(...data: any): void;
    debug(...data: any): void;
    log(...data: any): void;
    error(...data: any): void;
    private print;
}
