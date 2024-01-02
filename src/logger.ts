import winston from "winston";
import * as path from "path";
import * as fs from "fs";

export enum LogLevels {
    INFO = "INFO", ERROR = "ERROR", DEBUG = "DEBUG", LOG = "LOG", DATABASE = "DATABASE"
}

export class Logger {
    private readonly winstonLogger: winston.Logger;
    private readonly tag: string = "[UNTAGGED]";

    private logFormat: winston.Logform.Format = winston.format.printf((tmp: winston.Logform.TransformableInfo): string => {
        const {time, file, level, message} = tmp;
        return `${JSON.stringify({time, file: this.replaceAll(file, "\\", "/"), level, message})},`;
    });

    private replaceAll(string: string, match: string, replacer: string) {
        // @ts-ignore
        return ("" + string)?.replaceAll(match, replacer);
    }

    constructor(tag: string) {
        const fileName: string = this.getFileName();
        const logsDirectory = "logs";
        const logFilePath = path.join(logsDirectory, fileName + ".json");

        if (!fs.existsSync(logsDirectory)) {
            fs.mkdirSync(logsDirectory);
        }
        this.tag = tag;
        this.winstonLogger = winston.createLogger({
            format: winston.format.json(),
            transports: [new winston.transports.File({filename: logFilePath, format: this.logFormat})],
        });
    }


    private getFileName(): string {
        const now = new Date();
        return now.getDate() + "-" + (now.getMonth() + 1) + "-" + now.getFullYear();
    }

    public execStart(prefix: string = ""): number {
        this.print(LogLevels.INFO, `${prefix} - Execution started`);
        return performance.now();
    }

    public execStop(prefix: string = "", startTime: number, error: boolean = false): void {
        switch (error) {
            case true: {
                this.print(LogLevels.ERROR, `${prefix} - Execution ended due to an error. Execution time: ${performance.now() - startTime} ms`);
                break;
            }
            case false: {
                this.print(LogLevels.INFO, `${prefix} - Execution ended successfully. Execution time: ${performance.now() - startTime} ms`);
                break;
            }
        }
    }

    public info(...data: Object[]): void {
        this.print(LogLevels.INFO, ...data);
    }

    public dbLog(...data: Object[]): void {
        this.print(LogLevels.DATABASE, ...data);
    }

    public debug(...data: Object[]): void {
        this.print(LogLevels.DEBUG, ...data);
    }

    public log(...data: Object[]): void {
        this.print(LogLevels.LOG, ...data);
    }

    public error(...data: Object[]): void {
        this.print(LogLevels.ERROR, ...data);
    }

    private test() {
        let startTime = this.execStart("test");
        this.execStop("test", startTime);
        this.debug("test");
        this.log("test");
        this.error("test")
        this.dbLog("test");
    }

    private print(level: LogLevels = LogLevels.INFO, ...data: Object[]): void {
        const now: Date = new Date();
        let tag = this.tag.split("\\").pop();

        this.winstonLogger.defaultMeta = {
            file: tag, time: now, level
        };

        let logEntry: winston.LogEntry = {level: level, message: [...data].join(",")};
        //JSON.stringify([...data]);
        switch (level) {
            case LogLevels.INFO:
                this.winstonLogger.info(logEntry);
                console.info(`[INFO][${now}][${tag}]`, logEntry.message);
                break;
            case LogLevels.ERROR:
                this.winstonLogger.error(logEntry);
                console.error(`[ERROR][${now}][${tag}]`, logEntry.message);
                break;
            case LogLevels.DEBUG:
                this.winstonLogger.debug(logEntry);
                console.debug(`[DEBUG][${now}][${tag}]`, logEntry.message);
                break;
            case LogLevels.LOG: {
                this.winstonLogger.log(logEntry);
                console.log(`[LOG][${now}][${tag}]`, logEntry.message);
            }
        }

    }
}
