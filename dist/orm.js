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
var Orm = /** @class */ (function () {
    function Orm() {
    }
    Orm.quote = function (value) {
        return "\"" + value + "\"";
    };
    ;
    Orm.testConnection = function (options) {
        var logger = new logger_1.Logger(__filename);
        return new Promise(function (resolve, reject) {
            Firebird.attach(options, function (err, db) {
                if (err) {
                    logger.error("La connessione con il DATABASE non è andata a buon fine.");
                    return resolve(false);
                }
                logger.info("DATABASE connesso.");
                return resolve(true);
            });
        });
    };
    Orm.query = function (options, query, parameters) {
        if (parameters === void 0) { parameters = []; }
        return new Promise(function (resolve, reject) {
            Firebird.attach(options, function (err, db) {
                if (err) {
                    return reject(err);
                }
                db.query(query, parameters, function (error, result) {
                    if (error) {
                        db.detach();
                        return reject(error);
                    }
                    db.detach();
                    return resolve(result);
                });
            });
        });
    };
    Orm.execute = function (options, query, parameters) {
        var _this = this;
        if (parameters === void 0) { parameters = []; }
        return new Promise(function (resolve, reject) {
            Firebird.attach(options, function (err, db) {
                if (err) {
                    // tslint:disable-next-line:no-console
                    console.error(err);
                    return reject(err);
                }
                db.execute(query, parameters, function (error, result) {
                    if (error) {
                        db.detach();
                        // tslint:disable-next-line:no-console
                        console.log(query);
                        parameters.forEach(function (param, i) {
                            // tslint:disable-next-line:no-console
                            console.log(i + 1, param);
                        });
                        // tslint:disable-next-line:no-console
                        console.error(error);
                        return reject(error);
                    }
                    db.detach();
                    return resolve(_this.RESULT_EXEC_OK);
                });
            });
        });
    };
    Orm.trimParam = function (param) {
        if (typeof param === "string" || param instanceof String) {
            return param.trim();
        }
        return param;
    };
    Orm.RESULT_EXEC_OK = "ok!";
    return Orm;
}());
exports.Orm = Orm;
