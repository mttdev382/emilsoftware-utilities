"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseUtilities = exports.RestUtilities = exports.DateUtilities = exports.StatusCode = void 0;
var StatusCode;
(function (StatusCode) {
    StatusCode[StatusCode["Ok"] = 0] = "Ok";
    StatusCode[StatusCode["Warning"] = 1] = "Warning";
    StatusCode[StatusCode["Error"] = 2] = "Error";
})(StatusCode || (exports.StatusCode = StatusCode = {}));
var DateUtilities = /** @class */ (function () {
    function DateUtilities() {
    }
    /**
     * Pads a number with leading zeros to reach a specified length.
     * @param num - The number to pad.
     * @param totalLength - The total length of the resulting string.
     * @returns The padded string.
     */
    DateUtilities.addStartingZeros = function (num, totalLength) {
        return String(num).padStart(totalLength, '0');
    };
    /**
     * Formats a Date object as a Moncler-style string.
     * @param dData - The date to format.
     * @param bAddMs - Whether to include milliseconds.
     * @returns The formatted date string.
     */
    DateUtilities.dateToMoncler = function (dData, bAddMs) {
        if (bAddMs === void 0) { bAddMs = false; }
        var yy = dData.getFullYear();
        var mm = this.addStartingZeros(dData.getMonth() + 1, 2);
        var dd = this.addStartingZeros(dData.getDate(), 2);
        var hh = this.addStartingZeros(dData.getHours(), 2);
        var nn = this.addStartingZeros(dData.getMinutes(), 2);
        var ss = this.addStartingZeros(dData.getSeconds(), 2);
        var ms = this.addStartingZeros(dData.getMilliseconds(), 3);
        return bAddMs ? "".concat(yy).concat(mm).concat(dd).concat(hh).concat(nn).concat(ss).concat(ms) : "".concat(yy).concat(mm).concat(dd).concat(hh).concat(nn).concat(ss);
    };
    /**
     * Formats a Date object as a SQL-style string.
     * @param dData - The date to format.
     * @param bAddMs - Whether to include milliseconds.
     * @returns The formatted date string.
     */
    DateUtilities.dateToSql = function (dData, bAddMs) {
        if (bAddMs === void 0) { bAddMs = false; }
        var yy = dData.getFullYear();
        var mm = this.addStartingZeros(dData.getMonth() + 1, 2);
        var dd = this.addStartingZeros(dData.getDate(), 2);
        var hh = this.addStartingZeros(dData.getHours(), 2);
        var nn = this.addStartingZeros(dData.getMinutes(), 2);
        var ss = this.addStartingZeros(dData.getSeconds(), 2);
        var ms = this.addStartingZeros(dData.getMilliseconds(), 3);
        return bAddMs
            ? "".concat(yy, "-").concat(mm, "-").concat(dd, " ").concat(hh, ":").concat(nn, ":").concat(ss, ".").concat(ms)
            : "".concat(yy, "-").concat(mm, "-").concat(dd, " ").concat(hh, ":").concat(nn, ":").concat(ss);
    };
    /**
     * Formats a Date object as a simple string (dd-MM-yyyy).
     * @param dData - The date to format.
     * @returns The formatted date string.
     */
    DateUtilities.dateToSimple = function (dData) {
        var yy = dData.getFullYear();
        var mm = this.addStartingZeros(dData.getMonth() + 1, 2);
        var dd = this.addStartingZeros(dData.getDate(), 2);
        return "".concat(dd, "-").concat(mm, "-").concat(yy);
    };
    /**
     * Gets the current date and time as a formatted string.
     * @returns The current date and time in the format dd.MM.yyyy HH:mm:ss.
     */
    DateUtilities.getNowDateString = function () {
        var now = new Date();
        var day = now.getDate().toString().padStart(2, "0");
        var month = (now.getMonth() + 1).toString().padStart(2, "0");
        var year = now.getFullYear();
        var hours = now.getHours().toString().padStart(2, "0");
        var minutes = now.getMinutes().toString().padStart(2, "0");
        var seconds = now.getSeconds().toString().padStart(2, "0");
        return "".concat(day, ".").concat(month, ".").concat(year, " ").concat(hours, ":").concat(minutes, ":").concat(seconds);
    };
    /**
     * Parses a date string in the format dd/MM/yyyy into a Date object.
     * @param date - The date string to parse.
     * @returns A Date object.
     */
    DateUtilities.parseDate = function (date) {
        var parts = date.split("/");
        return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    };
    return DateUtilities;
}());
exports.DateUtilities = DateUtilities;
var RestUtilities = /** @class */ (function () {
    function RestUtilities() {
    }
    /**
     * Sends an OK message as a response.
     * @param res - Express Response object.
     * @param message - The success message.
     * @returns The Response object.
     */
    RestUtilities.sendOKMessage = function (res, message) {
        return res.send({
            severity: "success",
            status: 200,
            statusCode: StatusCode.Ok,
            message: message,
        });
    };
    /**
     * Sends an error message as a response.
     * @param res - Express Response object.
     * @param error - The error to send.
     * @param tag - Optional tag for additional context.
     * @param status - HTTP status code (default: 500).
     * @returns The Response object.
     */
    RestUtilities.sendErrorMessage = function (res, error, tag, status) {
        if (tag === void 0) { tag = "[BASE ERROR]"; }
        if (status === void 0) { status = 500; }
        return res.status(status).send({
            severity: "error",
            status: status,
            statusCode: StatusCode.Error,
            message: "An error occurred",
            error: "".concat(tag, ": ").concat(error),
        });
    };
    /**
     * Sends a base response with a payload.
     * @param res - Express Response object.
     * @param payload - The payload to include in the response.
     * @returns The Response object.
     */
    RestUtilities.sendBaseResponse = function (res, payload) {
        try {
            payload = JSON.parse(JSON.stringify(payload));
            var response = {
                Status: {
                    errorCode: "0",
                    errorDescription: "",
                },
                Result: payload,
                Message: "",
            };
            return res.send(response);
        }
        catch (error) {
            return this.sendErrorMessage(res, "Error sending response: ".concat(error), "[UTILITIES]", 500);
        }
    };
    /**
     * Sends an execution message as a response.
     * @param res - Express Response object.
     * @param executionObject - The execution data.
     * @param title - The title of the response.
     * @returns The Response object.
     */
    RestUtilities.sendExecMessage = function (res, executionObject, title) {
        try {
            var response = {
                Status: {
                    errorCode: "0",
                    errorDescription: "",
                },
                Sql: "",
                ID: executionObject === null || executionObject === void 0 ? void 0 : executionObject.id,
                data: executionObject,
                Title: title,
            };
            return res.send(response);
        }
        catch (error) {
            return this.sendErrorMessage(res, "Error sending execution message: ".concat(error), title, 500);
        }
    };
    /**
     * Prints a SQL query with parameters replaced.
     * @param query - The SQL query.
     * @param params - The parameters to replace.
     * @returns The formatted query.
     */
    RestUtilities.printQueryWithParams = function (query, params) {
        if (query === void 0) { query = ""; }
        try {
            params.forEach(function (param) {
                query = query.replace("?", param);
            });
            return query;
        }
        catch (error) {
            throw error;
        }
    };
    return RestUtilities;
}());
exports.RestUtilities = RestUtilities;
/**
 * Utility class for managing database-related configurations and operations.
 */
var DatabaseUtilities = /** @class */ (function () {
    function DatabaseUtilities() {
    }
    /**
     * Creates a configuration object for connecting to a Firebird database.
     *
     * @param {string} host - The hostname or IP address of the database server.
     * @param {number} port - The port number on which the database server is running.
     * @param {string} database - The path or alias of the database to connect to.
     * @param {string} [username='SYSDBA'] - The username for authentication. Defaults to 'SYSDBA'.
     * @param {string} [password='masterkey'] - The password for authentication. Defaults to 'masterkey'.
     * @returns {Options} - The configuration object to use for establishing a Firebird database connection.
     *
     * @example
     * ```typescript
     * const options = DatabaseUtilities.createOption(
     *   'localhost',
     *   3050,
     *   '/path/to/database.fdb',
     *   'myUsername',
     *   'myPassword'
     * );
     * ```
     */
    DatabaseUtilities.createOption = function (host, port, database, username, password) {
        if (username === void 0) { username = 'SYSDBA'; }
        if (password === void 0) { password = 'masterkey'; }
        return {
            host: host, // The hostname or IP address of the database server.
            port: port, // The port number used by the database server.
            user: username, // The username for database authentication.
            password: password, // The password for database authentication.
            database: database, // The path or alias of the target database.
            lowercase_keys: false, // Determines if the keys in query results should be in lowercase. Default: false.
            role: undefined, // The role for the database connection. Default: undefined.
            pageSize: 100000, // The page size for database transactions. Default: 100,000.
            retryConnectionInterval: 1000, // The interval (in ms) to retry a failed connection. Default: 1,000 ms.
            blobAsText: true, // Determines if BLOB fields should be treated as text. Default: true.
        };
    };
    return DatabaseUtilities;
}());
exports.DatabaseUtilities = DatabaseUtilities;
