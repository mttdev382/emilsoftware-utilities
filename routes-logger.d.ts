import { NextFunction, Request, Response } from "express";
import { Logger } from "./logger";
export declare function routesLogger(req: Request, res: Response, next: NextFunction, logger: Logger): void;
