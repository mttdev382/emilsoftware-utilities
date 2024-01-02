"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routesLogger = void 0;
// Middleware per misurare il tempo di esecuzione
function routesLogger(req, res, next, logger) {
    var start = new Date();
    // Funzione da eseguire dopo il completamento del controller
    res.on('finish', function () {
        var end = new Date();
        var elapsed = end.getTime() - start.getTime();
        logger.info("Tempo di esecuzione per ".concat(req.method, " ").concat(req.originalUrl, ": ").concat(elapsed, " ms"));
    });
    // Continua l'esecuzione della catena middleware
    return next();
}
exports.routesLogger = routesLogger;
