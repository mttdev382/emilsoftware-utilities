"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.LogLevels = void 0;
var winston_1 = __importDefault(require("winston"));
var path = __importStar(require("path"));
var fs_1 = require("fs");
var colorette_1 = require("colorette");
var LogLevels;
(function (LogLevels) {
    LogLevels["INFO"] = "INFO";
    LogLevels["ERROR"] = "ERROR";
    LogLevels["WARNING"] = "WARNING";
    LogLevels["DEBUG"] = "DEBUG";
    LogLevels["LOG"] = "LOG";
    LogLevels["DATABASE"] = "DATABASE";
})(LogLevels || (exports.LogLevels = LogLevels = {}));
var Logger = /** @class */ (function () {
    function Logger(tag, config) {
        var _this = this;
        this.tag = tag || "[UNTAGGED]";
        this.logDirectory = (config === null || config === void 0 ? void 0 : config.logDirectory) || "logs";
        // Default log format
        this.logFormat =
            (config === null || config === void 0 ? void 0 : config.customFormat) ||
                winston_1.default.format.printf(function (_a) {
                    var timestamp = _a.timestamp, file = _a.file, level = _a.level, message = _a.message, meta = __rest(_a, ["timestamp", "file", "level", "message"]);
                    return JSON.stringify(__assign({ timestamp: timestamp || new Date().toISOString(), tag: _this.tag, file: _this.replaceAll(file + "", "\\", "/"), level: level, message: message }, meta));
                });
        this.initializeDirectory();
        // Configure logger
        this.winstonLogger = winston_1.default.createLogger({
            format: winston_1.default.format.combine(winston_1.default.format.timestamp(), this.logFormat),
            transports: (config === null || config === void 0 ? void 0 : config.transports) || [
                new winston_1.default.transports.File({
                    filename: path.join(this.logDirectory, this.getFileName() + ".json"),
                }),
            ],
            levels: {
                error: 1,
                warn: 2,
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
        winston_1.default.addColors({
            database: "green",
            error: "red",
            warning: "yellow",
            info: "blue",
            debug: "magenta",
            log: "cyan",
        });
    }
    Logger.prototype.initializeDirectory = function () {
        return __awaiter(this, void 0, void 0, function () {
            var exists, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, fs_1.promises.access(this.logDirectory).then(function () { return true; }).catch(function () { return false; })];
                    case 1:
                        exists = _a.sent();
                        if (!!exists) return [3 /*break*/, 3];
                        return [4 /*yield*/, fs_1.promises.mkdir(this.logDirectory)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        err_1 = _a.sent();
                        console.error("Error initializing log directory:", err_1);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Logger.prototype.getFileName = function () {
        var now = new Date();
        var dateString = now.toISOString().split("T")[0]; // YYYY-MM-DD
        return dateString;
    };
    Logger.prototype.replaceAll = function (string, match, replacer) {
        return string.split(match).join(replacer);
    };
    Logger.prototype.execStart = function (prefix) {
        if (prefix === void 0) { prefix = ""; }
        this.print(LogLevels.INFO, "".concat(prefix, " - Execution started"));
        return performance.now();
    };
    Logger.prototype.execStop = function (prefix, startTime, error) {
        if (prefix === void 0) { prefix = ""; }
        if (error === void 0) { error = false; }
        var executionTime = performance.now() - startTime;
        var message = "".concat(prefix, " - Execution ended ").concat(error ? "due to an error" : "successfully", ". Execution time: ").concat(executionTime.toFixed(2), " ms");
        this.print(error ? LogLevels.ERROR : LogLevels.INFO, message);
    };
    Logger.prototype.info = function () {
        var data = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            data[_i] = arguments[_i];
        }
        this.print.apply(this, __spreadArray([LogLevels.INFO], data, false));
    };
    Logger.prototype.dbLog = function () {
        var data = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            data[_i] = arguments[_i];
        }
        this.print.apply(this, __spreadArray([LogLevels.DATABASE], data, false));
    };
    Logger.prototype.debug = function () {
        var data = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            data[_i] = arguments[_i];
        }
        this.print.apply(this, __spreadArray([LogLevels.DEBUG], data, false));
    };
    Logger.prototype.warning = function () {
        var data = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            data[_i] = arguments[_i];
        }
        this.print.apply(this, __spreadArray([LogLevels.WARNING], data, false));
    };
    Logger.prototype.log = function () {
        var data = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            data[_i] = arguments[_i];
        }
        this.print.apply(this, __spreadArray([LogLevels.LOG], data, false));
    };
    Logger.prototype.error = function () {
        var data = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            data[_i] = arguments[_i];
        }
        this.print.apply(this, __spreadArray([LogLevels.ERROR], data, false));
    };
    Logger.prototype.print = function (level) {
        var data = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            data[_i - 1] = arguments[_i];
        }
        var now = new Date();
        var fileName = this.tag.split("\\").pop() || this.tag;
        // Attach metadata to Winston logger
        this.winstonLogger.defaultMeta = {
            file: fileName,
            time: now,
            level: level,
        };
        var logEntry = {
            level: level.toLowerCase(),
            message: __spreadArray([], data, true).join(","),
        };
        // Log to console with colors
        switch (level) {
            case LogLevels.INFO:
                console.info((0, colorette_1.blue)("[INFO][".concat(now, "][").concat(fileName, "]")), logEntry.message);
                break;
            case LogLevels.ERROR:
                console.error((0, colorette_1.red)("[ERROR][".concat(now, "][").concat(fileName, "]")), logEntry.message);
                break;
            case LogLevels.DEBUG:
                console.debug((0, colorette_1.magenta)("[DEBUG][".concat(now, "][").concat(fileName, "]")), logEntry.message);
                break;
            case LogLevels.LOG:
                console.log((0, colorette_1.cyan)("[LOG][".concat(now, "][").concat(fileName, "]")), logEntry.message);
                break;
            case LogLevels.DATABASE:
                console.log((0, colorette_1.green)("[DATABASE][".concat(now, "][").concat(fileName, "]")), logEntry.message);
                break;
        }
        // Log to file
        this.winstonLogger.log(logEntry);
    };
    Logger.createLogger = function (tag, config) {
        return new Logger(tag, config);
    };
    return Logger;
}());
exports.Logger = Logger;
