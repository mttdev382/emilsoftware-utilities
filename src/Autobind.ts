export function autobind<T extends { new (...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
        constructor(...args: any[]) {
            super(...args);

            const prototype = Object.getPrototypeOf(this);
            const propertyNames = Object.getOwnPropertyNames(prototype);

            for (const key of propertyNames) {
                const descriptor = Object.getOwnPropertyDescriptor(prototype, key);

                if (descriptor && typeof descriptor.value === 'function' && key !== 'constructor') {
                    Object.defineProperty(this, key, {
                        value: descriptor.value.bind(this),
                        configurable: true,
                        writable: true,
                    });
                }
            }
        }
    };
}
