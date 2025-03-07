/**
 * Modulo che gestisce le operazioni di accesso degli utenti, incluse le rotte, il controller e il modello.
 * 
 * @module AccessiModule
 * @author mttdev382
 */
import { Options } from "es-node-firebird";
import { DynamicModule, Global, Module } from "@nestjs/common";
import { AccessiController } from "./Controllers/AccessiController";
import { AuthService } from "./Services/AuthService/AuthService";
import { EmailService } from "./Services/EmailService/EmailService";
import { PermissionService } from "./Services/PermissionService/PermissionService";
import { UserService } from "./Services/UserService/UserService";
import { EmailController } from "./Controllers/EmailController";
import { AuthController } from "./Controllers/AuthController";
import { PermissionController } from "./Controllers/PermissionController";

export interface JwtOptions {
    secret: string
    expiresIn: string
}

export interface EmailOptions {
    host: string,
    port: number,
    secure: boolean,
    from: string
    auth: {
        user: string,
        pass: string
    }
}

export interface AccessiOptions {
    databaseOptions: Options;
    encryptionKey: string;
    mockDemoUser: boolean;
    jwtOptions: JwtOptions;
    emailOptions: EmailOptions;
}


@Global()
@Module({
  controllers: [AccessiController, EmailController, AuthController, PermissionController],
  providers: [AuthService, UserService, EmailService, PermissionService],
  exports: [AuthService, UserService, EmailService, PermissionService],
})
export class AccessiModule {
  static forRoot(options: AccessiOptions): DynamicModule {
    
    return {
      module: AccessiModule,
      providers: [
        {
          provide: 'ACCESSI_OPTIONS',
          useValue: options,
        },
        AuthService,
        UserService,
        EmailService,
        PermissionService,
      ],
      exports: ['ACCESSI_OPTIONS', AuthService, UserService, EmailService, PermissionService],
    };
  }
}

