import {NextFunction, Request, Response} from "express";
import {Logger} from "./logger";

// Middleware per misurare il tempo di esecuzione
export function routesLogger(req: Request, res: Response, next: NextFunction, logger: Logger) {
    const start: Date = new Date();
    // Funzione da eseguire dopo il completamento del controller
    res.on('finish', (): void => {
        const end: Date = new Date();
        const elapsed: number = end.getTime() - start.getTime();

        logger.info(`Tempo di esecuzione per ${req.method} ${req.originalUrl}: ${elapsed} ms`);
    });
    // Continua l'esecuzione della catena middleware
    return next();
}
