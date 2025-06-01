import { DynamicModule, Module } from "@nestjs/common";
import { AccessiModule, AccessiOptions } from "./accessi-module/AccessiModule";
import { AllegatiModule, AllegatiOptions } from "./allegati-module/AllegatiModule";

/**
 * Configuration options for the unified module that combines Accessi and Allegati functionality
 */
export interface UnifiedModuleOptions {
    accessiOptions: AccessiOptions;
    allegatiOptions: AllegatiOptions;
}

/**
 * Unified module that combines user access management (Accessi) and file attachment management (Allegati)
 * into a single NestJS module with shared Swagger documentation
 */
@Module({})
export class UnifiedModule {
    static forRoot(options: UnifiedModuleOptions): DynamicModule {
        return {
            module: UnifiedModule,
            imports: [
                AccessiModule.forRoot(options.accessiOptions),
                AllegatiModule.forRoot(options.allegatiOptions),
            ],
            exports: [AccessiModule, AllegatiModule],
        };
    }
} 