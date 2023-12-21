"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utilities = void 0;
var Utilities = /** @class */ (function () {
    function Utilities() {
    }
    Utilities.parseDate = function (date) {
        var parts = date.split("/");
        return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    };
    Utilities.sendOKMessage = function (res, message) {
        return res.send({
            severity: "success", status: 200, statusCode: this.STATUS_CODE.OK,
            message: message,
        });
    };
    Utilities.getNowDateString = function () {
        var now = new Date();
        var day = now.getDate() < 9 ? "0" + now.getDate() : now.getDate();
        var month = (now.getMonth() + 1) < 9 ? "0" + (now.getMonth() + 1) : (now.getMonth() + 1);
        var year = now.getFullYear();
        var hours = now.getHours() < 9 ? "0" + now.getHours() : now.getHours();
        var minutes = now.getMinutes() < 9 ? "0" + now.getMinutes() : now.getMinutes();
        var seconds = now.getSeconds() < 9 ? "0" + now.getSeconds() : now.getSeconds();
        return day + "." + month + "." + year + " " + hours + ":" + minutes + ":" + seconds;
    };
    Utilities.sendErrorMessage = function (res, err, tag, status) {
        if (tag === void 0) { tag = "[BASE ERROR]"; }
        if (status === void 0) { status = 500; }
        // tslint:disable-next-line:no-console
        console.error(err);
        return res.status(status).send({
            severity: "error",
            status: 500,
            statusCode: this.STATUS_CODE.ERROR,
            message: " Si è verificato un errore",
            error: tag + ": " + err,
        });
    };
    // Risposte per funzioni in stile ES
    Utilities.sendOpenResponse = function (res, payload) {
        try {
            payload = JSON.parse(JSON.stringify(payload));
            var clearPayload = payload; // this.keysToCamel(payload);
            var response = {
                Status: {
                    errorCode: "0", errorDescription: "",
                }, Result: clearPayload, Message: ""
            };
            return res.send(response);
        }
        catch (error) {
            return this.sendOpenErrorMessage(res, "Errore nell'invio della risposta: " + error, "[UTILITIES]", 500);
        }
    };
    Utilities.sendOpenErrorMessage = function (res, err, tag, status) {
        if (tag === void 0) { tag = "[BASE ERROR]"; }
        if (status === void 0) { status = 500; }
        return res.status(status).send({
            Status: {
                errorCode: "500", errorDescription: err,
            }, Result: [], Message: err,
        });
    };
    Utilities.toCamel = function (s) {
        return s.replace(/([-_][a-z])/gi, function ($1) {
            return $1.toUpperCase().replace("-", "").replace("_", "");
        });
    };
    ;
    Utilities.isArray = function (a) {
        return Array.isArray(a);
    };
    ;
    Utilities.isObject = function (o) {
        return o === Object(o) && !this.isArray(o) && typeof o !== "function";
    };
    ;
    Utilities.keysToCamel = function (o) {
        var _this = this;
        if (this.isObject(o)) {
            var n_1 = {};
            Object.keys(o).forEach(function (k) {
                // @ts-ignore
                n_1[_this.toCamel(k)] = _this.keysToCamel(o[k]);
            });
            return n_1;
        }
        else if (this.isArray(o)) {
            return o.map(function (i) {
                return _this.keysToCamel(i);
            });
        }
        return o;
    };
    ;
    Utilities.addStartingZeros = function (num, totalLength) {
        return String(num).padStart(totalLength, '0');
    };
    Utilities.dateToMoncler = function (dData, bAddMs) {
        if (bAddMs === void 0) { bAddMs = false; }
        var yy = dData.getFullYear();
        var mm = this.addStartingZeros(dData.getMonth() + 1, 2);
        var dd = this.addStartingZeros(dData.getDate(), 2);
        var hh = this.addStartingZeros(dData.getHours(), 2);
        var nn = this.addStartingZeros(dData.getMinutes(), 2);
        var ss = this.addStartingZeros(dData.getSeconds(), 2);
        var ms = this.addStartingZeros(dData.getMilliseconds(), 3);
        if (bAddMs) {
            return yy + mm + dd + hh + nn + ss + ms;
        }
        else {
            return yy + mm + dd + hh + nn + ss;
        }
    };
    Utilities.dateToSql = function (dData, bAddMs) {
        if (bAddMs === void 0) { bAddMs = false; }
        var yy = dData.getFullYear();
        var mm = this.addStartingZeros(dData.getMonth() + 1, 2);
        var dd = this.addStartingZeros(dData.getDate(), 2);
        var hh = this.addStartingZeros(dData.getHours(), 2);
        var nn = this.addStartingZeros(dData.getMinutes(), 2);
        var ss = this.addStartingZeros(dData.getSeconds(), 2);
        var ms = this.addStartingZeros(dData.getMilliseconds(), 3);
        if (bAddMs) {
            return yy + '-' + mm + '-' + dd + ' ' + hh + ':' + nn + ':' + ss + '.' + ms;
        }
        else {
            return yy + '-' + mm + '-' + dd + ' ' + hh + ':' + nn + ':' + ss;
        }
    };
    Utilities.dateToSimple = function (dData) {
        var yy = dData.getFullYear();
        var mm = this.addStartingZeros(dData.getMonth() + 1, 2);
        var dd = this.addStartingZeros(dData.getDate(), 2);
        return dd + '-' + mm + '-' + yy;
    };
    Utilities.STATUS_CODE = {
        OK: 0, WARNING: 1, ERROR: 2,
    };
    return Utilities;
}());
exports.Utilities = Utilities;
