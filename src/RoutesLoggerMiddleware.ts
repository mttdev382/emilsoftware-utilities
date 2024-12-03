import { NextFunction, Request, Response } from "express";
import { Logger } from ".";

/**
 * Middleware class for logging the execution time of routes.
 */
export class RoutesLoggerMiddleware {
    private logger: Logger;

    /**
     * Initializes the logger instance to be used.
     * @param logger - The logger instance.
     */
    constructor(logger: Logger) {
        this.logger = logger;
    }

    /**
     * Middleware function to log the execution time of each route.
     * @param req - The incoming HTTP request.
     * @param res - The HTTP response.
     * @param next - The next middleware function in the chain.
     */
    logExecutionTime(req: Request, res: Response, next: NextFunction): void {
        const start: Date = new Date(); // Record the start time of the request.

        // Attach a listener to the response object to calculate the elapsed time.
        res.on("finish", (): void => {
            const end: Date = new Date(); // Record the end time of the request.
            const elapsed: number = end.getTime() - start.getTime(); // Calculate the elapsed time in milliseconds.

            // Log the HTTP method, URL, and execution time.
            this.logger.info(`Execution time for ${req.method} ${req.originalUrl}: ${elapsed} ms`);
        });

        // Continue to the next middleware function in the chain.
        next();
    }
}
