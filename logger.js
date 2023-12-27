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
var fs = __importStar(require("fs"));
var LogLevels;
(function (LogLevels) {
    LogLevels["INFO"] = "INFO";
    LogLevels["ERROR"] = "ERROR";
    LogLevels["DEBUG"] = "DEBUG";
    LogLevels["LOG"] = "LOG";
})(LogLevels || (exports.LogLevels = LogLevels = {}));
var Logger = /** @class */ (function () {
    function Logger(tag) {
        this.tag = "[UNTAGGED]";
        this.logFormat = winston_1.default.format.printf(function (tmp) {
            var time = tmp.time, file = tmp.file, level = tmp.level, message = tmp.message;
            return "".concat(JSON.stringify({ time: time, file: file === null || file === void 0 ? void 0 : file.replaceAll("\\", "/"), level: level, message: message }), ",");
        });
        var fileName = this.getFileName();
        var logsDirectory = "logs";
        var logFilePath = path.join(logsDirectory, fileName + ".json");
        if (!fs.existsSync(logsDirectory)) {
            fs.mkdirSync(logsDirectory);
        }
        this.tag = tag;
        this.winstonLogger = winston_1.default.createLogger({
            format: winston_1.default.format.json(),
            transports: [new winston_1.default.transports.File({ filename: logFilePath, format: this.logFormat })],
        });
    }
    Logger.prototype.getFileName = function () {
        var now = new Date();
        return now.getDate() + "-" + (now.getMonth() + 1) + "-" + now.getFullYear();
    };
    Logger.prototype.execStart = function (prefix) {
        if (prefix === void 0) { prefix = ""; }
        this.print(LogLevels.INFO, "".concat(prefix, " - Execution started"));
        return performance.now();
    };
    Logger.prototype.execStop = function (prefix, startTime, error) {
        if (prefix === void 0) { prefix = ""; }
        if (error === void 0) { error = false; }
        switch (error) {
            case true: {
                this.print(LogLevels.ERROR, "".concat(prefix, " - Execution ended due to an error. Execution time: ").concat(performance.now() - startTime, " ms"));
                break;
            }
            case false: {
                this.print(LogLevels.INFO, "".concat(prefix, " - Execution ended successfully. Execution time: ").concat(performance.now() - startTime, " ms"));
                break;
            }
        }
    };
    Logger.prototype.info = function () {
        var data = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            data[_i] = arguments[_i];
        }
        this.print.apply(this, __spreadArray([LogLevels.INFO], data, false));
    };
    Logger.prototype.debug = function () {
        var data = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            data[_i] = arguments[_i];
        }
        this.print.apply(this, __spreadArray([LogLevels.DEBUG], data, false));
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
        var _a;
        if (level === void 0) { level = LogLevels.INFO; }
        var data = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            data[_i - 1] = arguments[_i];
        }
        var now = new Date();
        // Utilities.getNowDateString();
        this.winstonLogger.defaultMeta = {
            file: this.tag, time: now,
            level: level
        };
        (_a = this.winstonLogger)[level.toLowerCase()].apply(_a, data);
        // @ts-ignore
        console[level.toLowerCase()].apply(console, __spreadArray(["[".concat(level, "][").concat(now, "][").concat(this.tag.split("\\").pop(), "]")], data, false));
    };
    return Logger;
}());
exports.Logger = Logger;
