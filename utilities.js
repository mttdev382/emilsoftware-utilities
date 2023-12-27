"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utilities = void 0;
var STATUS_CODE;
(function (STATUS_CODE) {
    STATUS_CODE[STATUS_CODE["OK"] = 0] = "OK";
    STATUS_CODE[STATUS_CODE["WARNING"] = 1] = "WARNING";
    STATUS_CODE[STATUS_CODE["ERROR"] = 2] = "ERROR";
})(STATUS_CODE || (STATUS_CODE = {}));
var parseDate = function (date) {
    var parts = date.split("/");
    return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
};
var sendOKMessage = function (res, message) {
    return res.send({
        severity: "success", status: 200, statusCode: STATUS_CODE.OK,
        message: message,
    });
};
var getNowDateString = function () {
    var now = new Date();
    var day = now.getDate() < 9 ? "0" + now.getDate() : now.getDate();
    var month = (now.getMonth() + 1) < 9 ? "0" + (now.getMonth() + 1) : (now.getMonth() + 1);
    var year = now.getFullYear();
    var hours = now.getHours() < 9 ? "0" + now.getHours() : now.getHours();
    var minutes = now.getMinutes() < 9 ? "0" + now.getMinutes() : now.getMinutes();
    var seconds = now.getSeconds() < 9 ? "0" + now.getSeconds() : now.getSeconds();
    return day + "." + month + "." + year + " " + hours + ":" + minutes + ":" + seconds;
};
var sendErrorMessage = function (res, err, tag, status) {
    if (tag === void 0) { tag = "[BASE ERROR]"; }
    if (status === void 0) { status = 500; }
    return res.status(status).send({
        severity: "error",
        status: 500,
        statusCode: STATUS_CODE.ERROR,
        message: " Si è verificato un errore",
        error: tag + ": " + err,
    });
};
var sendBaseResponse = function (res, payload) {
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
        return sendErrorMessage(res, "Errore nell'invio della risposta: " + error, "[UTILITIES]", 500);
    }
};
var toCamel = function (s) {
    return s.replace(/([-_][a-z])/gi, function ($1) {
        return $1.toUpperCase().replace("-", "").replace("_", "");
    });
};
var isArray = function (a) {
    return Array.isArray(a);
};
var isObject = function (o) {
    return o === Object(o) && !isArray(o) && typeof o !== "function";
};
var keysToCamel = function (o) {
    if (isObject(o)) {
        var n_1 = {};
        Object.keys(o).forEach(function (k) {
            // @ts-ignore
            n_1[toCamel(k)] = keysToCamel(o[k]);
        });
        return n_1;
    }
    else if (isArray(o)) {
        return o.map(function (i) {
            return keysToCamel(i);
        });
    }
    return o;
};
var addStartingZeros = function (num, totalLength) {
    return String(num).padStart(totalLength, '0');
};
var dateToMoncler = function (dData, bAddMs) {
    if (bAddMs === void 0) { bAddMs = false; }
    var yy = dData.getFullYear();
    var mm = addStartingZeros(dData.getMonth() + 1, 2);
    var dd = addStartingZeros(dData.getDate(), 2);
    var hh = addStartingZeros(dData.getHours(), 2);
    var nn = addStartingZeros(dData.getMinutes(), 2);
    var ss = addStartingZeros(dData.getSeconds(), 2);
    var ms = addStartingZeros(dData.getMilliseconds(), 3);
    if (bAddMs) {
        return yy + mm + dd + hh + nn + ss + ms;
    }
    else {
        return yy + mm + dd + hh + nn + ss;
    }
};
var dateToSql = function (dData, bAddMs) {
    if (bAddMs === void 0) { bAddMs = false; }
    var yy = dData.getFullYear();
    var mm = addStartingZeros(dData.getMonth() + 1, 2);
    var dd = addStartingZeros(dData.getDate(), 2);
    var hh = addStartingZeros(dData.getHours(), 2);
    var nn = addStartingZeros(dData.getMinutes(), 2);
    var ss = addStartingZeros(dData.getSeconds(), 2);
    var ms = addStartingZeros(dData.getMilliseconds(), 3);
    if (bAddMs) {
        return yy + '-' + mm + '-' + dd + ' ' + hh + ':' + nn + ':' + ss + '.' + ms;
    }
    else {
        return yy + '-' + mm + '-' + dd + ' ' + hh + ':' + nn + ':' + ss;
    }
};
var dateToSimple = function (dData) {
    var yy = dData.getFullYear();
    var mm = addStartingZeros(dData.getMonth() + 1, 2);
    var dd = addStartingZeros(dData.getDate(), 2);
    return dd + '-' + mm + '-' + yy;
};
exports.Utilities = {
    parseDate: parseDate,
    sendOKMessage: sendOKMessage,
    getNowDateString: getNowDateString,
    sendErrorMessage: sendErrorMessage,
    sendBaseResponse: sendBaseResponse,
    toCamel: toCamel,
    isArray: isArray,
    isObject: isObject,
    keysToCamel: keysToCamel,
    addStartingZeros: addStartingZeros,
    dateToMoncler: dateToMoncler,
    dateToSql: dateToSql,
    dateToSimple: dateToSimple
};
