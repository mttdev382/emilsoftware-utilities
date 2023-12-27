"use strict";
// DECORATOR
Object.defineProperty(exports, "__esModule", { value: true });
exports.boundClass = exports.boundMethod = void 0;
/**
 * Return a descriptor removing the value and returning a getter
 * The getter will return a .bind version of the function
 * and memoize the result against a symbol on the instance
 */
function boundMethod(target, key, descriptor) {
    var fn = descriptor === null || descriptor === void 0 ? void 0 : descriptor.value;
    if (typeof fn !== 'function') {
        throw new TypeError("@boundMethod decorator can only be applied to methods not: ".concat(typeof fn));
    }
    // In IE11 calling Object.defineProperty has a side effect of evaluating the
    // getter for the property which is being replaced. This causes infinite
    // recursion and an "Out of stack space" error.
    var definingProperty = false;
    return {
        configurable: true,
        get: function () {
            // eslint-disable-next-line no-prototype-builtins
            if (definingProperty || this === target.prototype || this.hasOwnProperty(key) ||
                typeof fn !== 'function') {
                return fn;
            }
            var boundFn = fn.bind(this);
            definingProperty = true;
            if (key) {
                Object.defineProperty(this, key, {
                    configurable: true,
                    get: function () {
                        return boundFn;
                    },
                    set: function (value) {
                        fn = value;
                        // @ts-ignore
                        delete this[key];
                    }
                });
            }
            definingProperty = false;
            return boundFn;
        },
        set: function (value) {
            fn = value;
        }
    };
}
exports.boundMethod = boundMethod;
/**
 * Use boundMethod to bind all methods on the target.prototype
 */
function boundClass(target) {
    // (Using reflect to get all keys including symbols)
    var keys;
    // Use Reflect if exists
    if (typeof Reflect !== 'undefined' && typeof Reflect.ownKeys === 'function') {
        keys = Reflect.ownKeys(target.prototype);
    }
    else {
        keys = Object.getOwnPropertyNames(target.prototype);
        // Use symbols if support is provided
        if (typeof Object.getOwnPropertySymbols === 'function') {
            // @ts-ignore
            keys = keys.concat(Object.getOwnPropertySymbols(target.prototype));
        }
    }
    keys.forEach(function (key) {
        // Ignore special case target method
        if (key === 'constructor') {
            return;
        }
        var descriptor = Object.getOwnPropertyDescriptor(target.prototype, key);
        // Only methods need binding
        if (typeof (descriptor === null || descriptor === void 0 ? void 0 : descriptor.value) === 'function') {
            Object.defineProperty(target.prototype, key, boundMethod(target, key, descriptor));
        }
    });
    return target;
}
exports.boundClass = boundClass;
function autobind() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    if (args.length === 1) {
        // @ts-ignore
        return boundClass.apply(void 0, args);
    }
    // @ts-ignore
    return boundMethod.apply(void 0, args);
}
exports.default = autobind;
