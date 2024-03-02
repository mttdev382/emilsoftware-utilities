"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Orm = void 0;
// @ts-ignore
var Firebird = __importStar(require("es-node-firebird"));
var logger_1 = require("./logger");
var utilities_1 = require("./utilities");
var logger = new logger_1.Logger(__filename);
var quote = function (value) {
    return "\"" + value + "\"";
};
var testConnection = function (options) {
    return new Promise(function (resolve) {
        Firebird.attach(options, function (err, db) {
            if (err) {
                logger.error('La connessione con il DATABASE non è andata a buon fine.');
                return resolve(false);
            }
            logger.info("DATABASE connesso.");
            if (db)
                db.detach();
            return resolve(true);
        });
    });
};
var query = function (options, query, parameters) {
    if (parameters === void 0) { parameters = []; }
    try {
        return new Promise(function (resolve, reject) {
            Firebird.attach(options, function (err, db) {
                if (err) {
                    logger.error(err);
                    return reject(err);
                }
                logger.info(utilities_1.Utilities.printQueryWithParams(query, parameters));
                db.query(query, parameters, function (error, result) {
                    if (error) {
                        logger.error(error);
                        db.detach();
                        return reject(error);
                    }
                    db.detach();
                    return resolve(result);
                });
            });
        });
    }
    catch (error) {
        logger.error(error);
        throw error;
    }
};
var execute = function (options, query, parameters) {
    if (parameters === void 0) { parameters = []; }
    try {
        return new Promise(function (resolve, reject) {
            Firebird.attach(options, function (err, db) {
                if (err) {
                    logger.error(err);
                    return reject(err);
                }
                logger.info(utilities_1.Utilities.printQueryWithParams(query, parameters));
                db.execute(query, parameters, function (error, result) {
                    if (error) {
                        logger.error(error);
                        db.detach();
                        return reject(error);
                    }
                    db.detach();
                    return resolve(result);
                });
            });
        });
    }
    catch (error) {
        logger.error(error);
        throw error;
    }
};
var trimParam = function (param) {
    if (typeof param === "string" || param instanceof String) {
        return param.trim();
    }
    return param;
};
var connect = function (options) {
    return new Promise(function (resolve, reject) {
        Firebird.attach(options, function (err, db) {
            if (err)
                return reject(err);
            else
                return resolve(db);
        });
    });
};
var startTransaction = function (db) {
    return new Promise(function (resolve, reject) {
        db.transaction(Firebird.ISOLATION_READ_COMMITTED, function (err, transaction) {
            if (err)
                return reject(err);
            else
                return resolve(transaction);
        });
    });
};
var commitTransaction = function (transaction) {
    return new Promise(function (resolve, reject) {
        transaction.commit(function (err) {
            if (err)
                return reject(err);
            else
                return resolve('Transaction committed successfully.');
        });
    });
};
var rollbackTransaction = function (transaction) {
    return new Promise(function (resolve, reject) {
        transaction.rollback(function (err) {
            if (err)
                return reject(err);
            else
                return resolve('Transaction rolled back successfully.');
        });
    });
};
var executeQueries = function (transaction, queries, params) {
    return queries.reduce(function (promiseChain, currentQuery, index) {
        return promiseChain.then(function () { return new Promise(function (resolve, reject) {
            transaction.query(currentQuery, params[index], function (err, result) {
                if (err)
                    return reject(err);
                else
                    return resolve(result);
            });
        }); });
    }, Promise.resolve());
};
exports.Orm = {
    quote: quote,
    testConnection: testConnection,
    query: query,
    execute: execute,
    trimParam: trimParam,
    connect: connect,
    startTransaction: startTransaction,
    executeQueries: executeQueries,
    commitTransaction: commitTransaction,
    rollbackTransaction: rollbackTransaction
};
