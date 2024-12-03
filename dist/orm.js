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
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Orm = void 0;
// @ts-ignore
var Firebird = __importStar(require("es-node-firebird"));
var Logger_1 = require("./Logger");
var Utilities_1 = require("./Utilities");
var Autbobind_1 = require("./Autbobind");
var Orm = function () {
    var _a;
    var _classDecorators = [(_a = Autbobind_1.Autobind).apply.bind(_a)];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var Orm = _classThis = /** @class */ (function () {
        function Orm_1() {
        }
        Orm_1.quote = function (value) {
            return "\"" + value + "\"";
        };
        Orm_1.testConnection = function (options) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    return [2 /*return*/, new Promise(function (resolve) {
                            Firebird.attach(options, function (err, db) {
                                if (err) {
                                    _this.logger.error('La connessione con il DATABASE non è andata a buon fine.');
                                    return resolve(false);
                                }
                                _this.logger.info("DATABASE connesso.");
                                if (db)
                                    db.detach();
                                return resolve(true);
                            });
                        })];
                });
            });
        };
        Orm_1.query = function (options_1, query_1) {
            return __awaiter(this, arguments, void 0, function (options, query, parameters, logQuery) {
                var _this = this;
                if (parameters === void 0) { parameters = []; }
                if (logQuery === void 0) { logQuery = false; }
                return __generator(this, function (_a) {
                    try {
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                Firebird.attach(options, function (err, db) {
                                    if (err) {
                                        _this.logger.error(err);
                                        return reject(err);
                                    }
                                    if (logQuery)
                                        _this.logger.info(Utilities_1.RestUtilities.printQueryWithParams(query, parameters));
                                    db.query(query, parameters, function (error, result) {
                                        if (error) {
                                            _this.logger.error(error);
                                            db.detach();
                                            return reject(error);
                                        }
                                        db.detach();
                                        return resolve(result);
                                    });
                                });
                            })];
                    }
                    catch (error) {
                        this.logger.error(error);
                        throw error;
                    }
                    return [2 /*return*/];
                });
            });
        };
        Orm_1.execute = function (options_1, query_1) {
            return __awaiter(this, arguments, void 0, function (options, query, parameters, logQuery) {
                var _this = this;
                if (parameters === void 0) { parameters = []; }
                if (logQuery === void 0) { logQuery = false; }
                return __generator(this, function (_a) {
                    try {
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                Firebird.attach(options, function (err, db) {
                                    if (err) {
                                        _this.logger.error(err);
                                        return reject(err);
                                    }
                                    if (logQuery)
                                        _this.logger.info(Utilities_1.RestUtilities.printQueryWithParams(query, parameters));
                                    db.execute(query, parameters, function (error, result) {
                                        if (error) {
                                            _this.logger.error(error);
                                            db.detach();
                                            return reject(error);
                                        }
                                        db.detach();
                                        return resolve(result);
                                    });
                                });
                            })];
                    }
                    catch (error) {
                        this.logger.error(error);
                        throw error;
                    }
                    return [2 /*return*/];
                });
            });
        };
        Orm_1.trimParam = function (param) {
            if (typeof param === "string" || param instanceof String) {
                return param.trim();
            }
            return param;
        };
        Orm_1.connect = function (options) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            Firebird.attach(options, function (err, db) {
                                if (err)
                                    return reject(err);
                                else
                                    return resolve(db);
                            });
                        })];
                });
            });
        };
        Orm_1.startTransaction = function (db) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            db.transaction(Firebird.ISOLATION_READ_COMMITTED, function (err, transaction) {
                                if (err)
                                    return reject(err);
                                else
                                    return resolve(transaction);
                            });
                        })];
                });
            });
        };
        Orm_1.commitTransaction = function (transaction) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            transaction.commit(function (err) {
                                if (err)
                                    return reject(err);
                                else
                                    return resolve('Transaction committed successfully.');
                            });
                        })];
                });
            });
        };
        Orm_1.rollbackTransaction = function (transaction) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            transaction.rollback(function (err) {
                                if (err)
                                    return reject(err);
                                else
                                    return resolve('Transaction rolled back successfully.');
                            });
                        })];
                });
            });
        };
        Orm_1.executeMultiple = function (options, queriesWithParams) {
            return __awaiter(this, void 0, void 0, function () {
                var db, transaction, _loop_1, _i, queriesWithParams_1, qwp, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 8, , 11]);
                            return [4 /*yield*/, Orm.connect(options)];
                        case 1:
                            db = _a.sent();
                            return [4 /*yield*/, Orm.startTransaction(db)];
                        case 2:
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
                        case 6: return [4 /*yield*/, Orm.commitTransaction(transaction)];
                        case 7:
                            _a.sent();
                            db.detach();
                            return [2 /*return*/, 'OK'];
                        case 8:
                            error_1 = _a.sent();
                            if (!transaction) return [3 /*break*/, 10];
                            return [4 /*yield*/, Orm.rollbackTransaction(transaction)];
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
            });
        };
        Orm_1.executeQueries = function (transaction, queries, params) {
            return __awaiter(this, void 0, void 0, function () {
                var error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 4]);
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
                        case 1: return [2 /*return*/, _a.sent()];
                        case 2:
                            error_2 = _a.sent();
                            return [4 /*yield*/, new Promise(function (resolve, reject) {
                                    transaction.rollback(function (rollbackErr) {
                                        if (rollbackErr) {
                                            return reject(rollbackErr);
                                        }
                                        else {
                                            return reject(error_2);
                                        }
                                    });
                                })];
                        case 3: return [2 /*return*/, _a.sent()];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        return Orm_1;
    }());
    __setFunctionName(_classThis, "Orm");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Orm = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
    })();
    _classThis.logger = new Logger_1.Logger(Orm.name);
    (function () {
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Orm = _classThis;
}();
exports.Orm = Orm;
