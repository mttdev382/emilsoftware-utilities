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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var executeMultiple = function (options, queriesWithParams) { return __awaiter(void 0, void 0, void 0, function () {
    var db, transaction, _loop_1, _i, queriesWithParams_1, qwp, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 8, , 11]);
                return [4 /*yield*/, connect(options)];
            case 1:
                // Connetti al database
                db = _a.sent();
                return [4 /*yield*/, startTransaction(db)];
            case 2:
                // Inizia la transazione
                transaction = _a.sent();
                _loop_1 = function (qwp) {
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0: return [4 /*yield*/, new Promise(function (resolve, reject) {
                                    transaction.query(qwp.query, qwp.params, function (err, result) {
                                        if (err)
                                            return reject(err);
                                        else
                                            return resolve(result);
                                    });
                                })];
                            case 1:
                                _b.sent();
                                return [2 /*return*/];
                        }
                    });
                };
                _i = 0, queriesWithParams_1 = queriesWithParams;
                _a.label = 3;
            case 3:
                if (!(_i < queriesWithParams_1.length)) return [3 /*break*/, 6];
                qwp = queriesWithParams_1[_i];
                return [5 /*yield**/, _loop_1(qwp)];
            case 4:
                _a.sent();
                _a.label = 5;
            case 5:
                _i++;
                return [3 /*break*/, 3];
            case 6: 
            // Commit della transazione
            return [4 /*yield*/, commitTransaction(transaction)];
            case 7:
                // Commit della transazione
                _a.sent();
                // Stacca il database
                db.detach();
                // Ritorna il messaggio di successo
                return [2 /*return*/, 'OK'];
            case 8:
                error_1 = _a.sent();
                if (!transaction) return [3 /*break*/, 10];
                return [4 /*yield*/, rollbackTransaction(transaction)];
            case 9:
                _a.sent();
                _a.label = 10;
            case 10:
                if (db) {
                    db.detach();
                }
                throw error_1;
            case 11: return [2 /*return*/];
        }
    });
}); };
var executeQueries = function (transaction, queries, params) { return __awaiter(void 0, void 0, void 0, function () {
    var error_2, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 6, , 7]);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 5]);
                return [4 /*yield*/, queries.reduce(function (promiseChain, currentQuery, index) {
                        return promiseChain.then(function () { return new Promise(function (resolve, reject) {
                            transaction.query(currentQuery, params[index], function (err, result) {
                                if (err)
                                    return reject(err);
                                else
                                    return resolve(result);
                            });
                        }); });
                    }, Promise.resolve())];
            case 2: return [2 /*return*/, _a.sent()];
            case 3:
                error_2 = _a.sent();
                return [4 /*yield*/, new Promise(function (resolve_1, reject_1) {
                        transaction.rollback(function (rollbackErr) {
                            if (rollbackErr) {
                                return reject_1(rollbackErr);
                            }
                            else {
                                return reject_1(error_2);
                            }
                        });
                    })];
            case 4: return [2 /*return*/, _a.sent()];
            case 5: return [3 /*break*/, 7];
            case 6:
                error_3 = _a.sent();
                throw error_3;
            case 7: return [2 /*return*/];
        }
    });
}); };
exports.Orm = {
    quote: quote,
    testConnection: testConnection,
    query: query,
    execute: execute,
    trimParam: trimParam,
    connect: connect,
    startTransaction: startTransaction,
    executeQueries: executeQueries,
    executeMultiple: executeMultiple,
    commitTransaction: commitTransaction,
    rollbackTransaction: rollbackTransaction
};
