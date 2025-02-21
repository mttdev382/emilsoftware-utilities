import { Container } from "inversify";
import { IUserService } from "./Services/UserService/IUserService";
import { UserService } from "./Services/UserService/UserService";
import { IAuthService } from "./Services/AuthService/IAuthService";
import { AuthService } from "./Services/AuthService/AuthService";
import { IPermissionService } from "./Services/PermissionService/IPermissionService";
import { PermissionService } from "./Services/PermissionService/PermissionService";
import { IEmailService } from "./Services/EmailService/IEmailService";
import { EmailService } from "./Services/EmailService/EmailService";
import { AccessiController } from "./AccessiController";
import { AccessiOptions, AccessiModule } from "./AccessiModule";
import { AccessiRoutes } from "./AccessiRoutes";
import { AccessiControllerBase } from "./AccessiControllerBase";


const container = new Container({ defaultScope: "Singleton" });

container.bind<AccessiOptions>("AccessiOptions").toConstantValue({
    databaseOptions: {},
    mockDemoUser: false,
    encryptionKey: "",
    jwtOptions: { secret: "", expiresIn: "1h" },
    emailOptions: {
        auth: {
            user: "",
            pass: ""
        },
        host: "",
        port: 0,
        secure: false
    }
});

container.bind<IUserService>("IUserService").to(UserService);
container.bind<IAuthService>("IAuthService").to(AuthService);
container.bind<IPermissionService>("IPermissionService").to(PermissionService);
container.bind<IEmailService>("IEmailService").to(EmailService);
container.bind<AccessiControllerBase>("AccessiControllerBase").to(AccessiController);
container.bind<AccessiRoutes>(AccessiRoutes).toSelf();
container.bind<AccessiModule>(AccessiModule).toSelf();

export { container };
