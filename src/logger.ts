import {Utilities} from "./utilities";
import winston from "winston";
import * as path from "path";
import * as fs from "fs";

export enum LogLevels {
    INFO = "INFO", ERROR = "ERROR", DEBUG = "DEBUG", LOG = "LOG"
}

export class Logger {
    private readonly winstonLogger: any;
    public tag: string = "[UNTAGGED]";

    private logFormat: winston.Logform.Format = winston.format.printf((tmp: winston.Logform.TransformableInfo): string => {
        const {time, file, level, message} = tmp;
        return `${JSON.stringify({time, file: file?.replaceAll("\\", "/"), level, message})},`;
    });

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

    public execStart(prefix: string = ""): any {
        this.print(LogLevels.INFO, `${prefix} - Execution started`);
        return performance.now();
    }

    public execStop(prefix: string = "", startTime: any, error: boolean = false): any {
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

    public info(...data: any): void {
        this.print(LogLevels.INFO, ...data);
    }

    public debug(...data: any): void {
        this.print(LogLevels.DEBUG, ...data);
    }

    public log(...data: any): void {
        this.print(LogLevels.LOG, ...data);
    }

    public error(...data: any): void {
        this.print(LogLevels.ERROR, ...data);
    }

    private print(level: LogLevels = LogLevels.INFO, ...data: any): void {
        const now = new Date();
        // Utilities.getNowDateString();
        this.winstonLogger.defaultMeta = {
            file: this.tag, time: now, level
        };
        this.winstonLogger[level.toLowerCase()](...data);
        // @ts-ignore
        console[level.toLowerCase()](`[${level}][${now}][${this.tag.split("\\").pop()}]`, ...data);
    }
}
