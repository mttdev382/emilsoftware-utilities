import winston from "winston";
import * as path from "path";
import { promises as fs } from "fs";
import { blue, red, magenta, green, cyan, yellow } from 'colorette';

export enum LogLevels {
    INFO = "INFO",
    ERROR = "ERROR",
    WARNING = "WARNING",
    DEBUG = "DEBUG",
    LOG = "LOG",
    DATABASE = "DATABASE",
}

export class Logger {
    private readonly winstonLogger: winston.Logger;
    private readonly tag: string;
    private readonly logDirectory: string;
    private logFormat: winston.Logform.Format;

    constructor(
        tag: string,
        config?: {
            logDirectory?: string;
            customFormat?: winston.Logform.Format;
            transports?: winston.transport[];
        }
    ) {
        this.tag = tag || "[UNTAGGED]";
        this.logDirectory = config?.logDirectory || "logs";

        // Default log format
        this.logFormat =
            config?.customFormat ||
            winston.format.printf(({ timestamp, file, level, message, ...meta }) => {
                return JSON.stringify({
                    timestamp: timestamp || new Date().toISOString(),
                    tag: this.tag,
                    file: this.replaceAll(file + "", "\\", "/"),
                    level,
                    message,
                    ...meta,
                });
            });

        this.initializeDirectory();

        // Configure logger
        this.winstonLogger = winston.createLogger({
            format: winston.format.combine(winston.format.timestamp(), this.logFormat),
            transports: config?.transports || [
                new winston.transports.File({
                    filename: path.join(this.logDirectory, this.getFileName() + ".json"),
                }),
            ],
            levels: {
                error: 1,
                warning: 2,
                info: 3,
                http: 4,
                verbose: 5,
                debug: 6,
                silly: 7,
                database: 8,
            },
        });

        // Add colors for console logging
        winston.addColors({
            database: "green",
            error: "red",
            warning: "yellow",
            info: "blue",
            debug: "magenta",
            log: "cyan",
        });
    }

    private async initializeDirectory() {
        try {
            const exists = await fs.access(this.logDirectory).then(() => true).catch(() => false);
            if (!exists) {
                await fs.mkdir(this.logDirectory);
            }
        } catch (err) {
            console.error("Error initializing log directory:", err);
        }
    }

    private getFileName(): string {
        const now = new Date();
        const dateString = now.toISOString().split("T")[0]; // YYYY-MM-DD
        return dateString;
    }

    private replaceAll(string: string, match: string, replacer: string) {
        return string.split(match).join(replacer);
    }

    public execStart(prefix: string = ""): number {
        this.print(LogLevels.INFO, `${prefix} - Execution started`);
        return performance.now();
    }

    public execStop(prefix: string = "", startTime: number, error: boolean = false): void {
        const executionTime = performance.now() - startTime;
        const message = `${prefix} - Execution ended ${error ? "due to an error" : "successfully"
            }. Execution time: ${executionTime.toFixed(2)} ms`;
        this.print(error ? LogLevels.ERROR : LogLevels.INFO, message);
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

    public warning(...data: Object[]): void {
        this.print(LogLevels.WARNING, ...data);
    }

    public log(...data: Object[]): void {
        this.print(LogLevels.LOG, ...data);
    }

    public error(...data: Object[]): void {
        this.print(LogLevels.ERROR, ...data);
    }

    private print(level: LogLevels, ...data: Object[]): void {
        const now: Date = new Date();
        const fileName = this.tag.split("\\").pop() || this.tag;

        // Attach metadata to Winston logger
        this.winstonLogger.defaultMeta = {
            file: fileName,
            time: now,
            level,
        };

        const logEntry: winston.LogEntry = {
            level: level.toLowerCase(),
            message: [...data].join(","),
        };

        // Log to console with colors
        switch (level) {
            case LogLevels.INFO:
                console.info(blue(`[INFO][${now}][${fileName}]`), logEntry.message);
                break;
            case LogLevels.ERROR:
                console.error(red(`[ERROR][${now}][${fileName}]`), logEntry.message);
                break;
            case LogLevels.DEBUG:
                console.debug(magenta(`[DEBUG][${now}][${fileName}]`), logEntry.message);
                break;
            case LogLevels.WARNING:
                console.debug(yellow(`[WARNING][${now}][${fileName}]`), logEntry.message);
                break;
            case LogLevels.LOG:
                console.log(cyan(`[LOG][${now}][${fileName}]`), logEntry.message);
                break;
            case LogLevels.DATABASE:
                console.log(green(`[DATABASE][${now}][${fileName}]`), logEntry.message);
                break;
        }

        // Log to file
        this.winstonLogger.log(logEntry);
    }

    public static createLogger(tag: string, config?: { logDirectory?: string }): Logger {
        return new Logger(tag, config);
    }
}
