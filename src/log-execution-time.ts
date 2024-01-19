// DECORATOR
import {Logger} from "./logger";

export default function logExecutionTime(fileName: string = "") {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        const logger: Logger = new Logger(fileName);
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args: any[]) {
            const start = process.hrtime();
            logger.info(` ${propertyKey} method execution started . . .`);
            try {
                const result = await originalMethod.apply(this, args);
                const end = process.hrtime(start);
                const durationInMilliseconds = end[0] * 1000 + end[1] / 1e6;
                logger.info(` ${propertyKey} method took ${durationInMilliseconds.toFixed(2)} ms to execute`)
                return result;
            } catch (error) {
                throw error;
            }
        };
        return descriptor;
    }
}
