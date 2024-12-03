export class Autobind {
    /**
     * Binds a method to the instance, ensuring `this` references are preserved.
     */
    static boundMethod(target: any, key: any, descriptor: any) {
        let fn = descriptor?.value;

        if (typeof fn !== 'function') {
            throw new TypeError(`@boundMethod decorator can only be applied to methods, not: ${typeof fn}`);
        }

        let definingProperty = false;

        return {
            configurable: true,
            get() {
                if (
                    definingProperty ||
                    this === target.prototype ||
                    Object.prototype.hasOwnProperty.call(this, key) ||
                    typeof fn !== 'function'
                ) {
                    return fn;
                }

                const boundFn = fn.bind(this);
                definingProperty = true;

                Object.defineProperty(this, key, {
                    configurable: true,
                    get() {
                        return boundFn;
                    },
                    set(value) {
                        fn = value;
                        delete this[key];
                    },
                });

                definingProperty = false;
                return boundFn;
            },
            set(value: any) {
                fn = value;
            },
        };
    }

    /**
     * Applies `boundMethod` to all methods in the class prototype.
     */
    static boundClass(target: any) {
        const keys = Autobind.getPrototypeKeys(target.prototype);

        keys.forEach((key) => {
            if (key === 'constructor') return;

            const descriptor = Object.getOwnPropertyDescriptor(target.prototype, key);

            if (descriptor && typeof descriptor.value === 'function') {
                Object.defineProperty(target.prototype, key, Autobind.boundMethod(target, key, descriptor));
            }
        });

        return target;
    }

    /**
     * Retrieves all property keys (including symbols) from the prototype.
     */
    private static getPrototypeKeys(proto: any): Array<string | symbol> {
        if (typeof Reflect !== 'undefined' && typeof Reflect.ownKeys === 'function') {
            return Reflect.ownKeys(proto);
        }

        const keys = Object.getOwnPropertyNames(proto);

        if (typeof Object.getOwnPropertySymbols === 'function') {
            return keys.concat(Object.getOwnPropertySymbols(proto) as any);
        }

        return keys;
    }

    public static apply(...args: any[]) {
        if (args.length === 1) {
            return Autobind.boundClass(args[0]);
        }
    
        return Autobind.boundMethod(args[0], args[1], args[2]);
    }

}
