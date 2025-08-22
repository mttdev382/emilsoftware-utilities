import winston from "winston";
import * as path from "path";
import * as fs from "fs"; // sincrono per evitare race
import { blue, red, magenta, green, cyan, yellow } from "colorette";

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

    // 1) Garantisce che la cartella di log esista PRIMA di creare i transports
    this.initializeDirectorySync();

    // 2) Formato default (JSONL), retrocompatibile
    this.logFormat =
      config?.customFormat ||
      winston.format.printf(({ timestamp, file, level, message, ...meta }) => {
        return JSON.stringify({
          timestamp: timestamp || new Date().toISOString(),
          tag: this.tag,
          file: this.replaceAll(String(file ?? ""), "\\", "/"),
          level,
          message,
          ...meta,
        });
      });

    // 3) Configurazione logger
    this.winstonLogger = winston.createLogger({
      // Soglia globale: registra TUTTO (importante per livelli custom)
      level: "silly",
      format: winston.format.combine(winston.format.timestamp(), this.logFormat),
      transports:
        config?.transports ||
        [
          new winston.transports.File({
            filename: path.join(this.logDirectory, this.getFileName() + ".json"),
            // facoltativo: level: "silly"
          }),
        ],
      // Mappa livelli custom (coerente con il tuo codice)
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
      exitOnError: false,
    });

    // 4) Colori per la console
    winston.addColors({
      database: "green",
      error: "red",
      warning: "yellow",
      info: "blue",
      debug: "magenta",
      log: "cyan",
    });
  }

  /**
   * Creazione cartella log in modo SINCRONO per evitare race con i transports.
   */
  private initializeDirectorySync(): void {
    try {
      if (!fs.existsSync(this.logDirectory)) {
        fs.mkdirSync(this.logDirectory, { recursive: true });
      }
    } catch (err) {
      // In caso di fallimento, almeno stampiamo in stderr
      // (il file transport fallirà uguale ma non blocchiamo l'app)
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

  public execStop(
    prefix: string = "",
    startTime: number,
    error: boolean = false
  ): void {
    const executionTime = performance.now() - startTime;
    const message = `${prefix} - Execution ended ${
      error ? "due to an error" : "successfully"
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

    // Allego meta al logger (verrà fuso nel formatter)
    this.winstonLogger.defaultMeta = {
      file: fileName,
      time: now,
      level, // livello "umano" (INFO/ERROR/...)
    };

    const logEntry: winston.LogEntry = {
      level: level.toLowerCase(), // deve combaciare con la mappa livelli di Winston
      message: [...data].join(","),
    };

    // Console leggibile e colorata
    switch (level) {
      case LogLevels.INFO:
        console.info(blue(`[INFO][${now.toISOString()}][${fileName}]`), logEntry.message);
        break;
      case LogLevels.ERROR:
        console.error(red(`[ERROR][${now.toISOString()}][${fileName}]`), logEntry.message);
        break;
      case LogLevels.DEBUG:
        console.debug(magenta(`[DEBUG][${now.toISOString()}][${fileName}]`), logEntry.message);
        break;
      case LogLevels.WARNING:
        console.warn(yellow(`[WARNING][${now.toISOString()}][${fileName}]`), logEntry.message);
        break;
      case LogLevels.LOG:
        console.log(cyan(`[LOG][${now.toISOString()}][${fileName}]`), logEntry.message);
        break;
      case LogLevels.DATABASE:
        console.log(green(`[DATABASE][${now.toISOString()}][${fileName}]`), logEntry.message);
        break;
    }

    // Scrittura su file via Winston
    this.winstonLogger.log(logEntry);
  }

  public static createLogger(tag: string, config?: { logDirectory?: string }): Logger {
    return new Logger(tag, config);
  }
}
