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
import { IAccessiRoutes } from "./IAccessiRoutes";

const container = new Container({ defaultScope: "Singleton" });

console.log("🔍 Verifica delle importazioni:");
console.log("UserService:", UserService);
console.log("AuthService:", AuthService);
console.log("PermissionService:", PermissionService);
console.log("EmailService:", EmailService);
console.log("AccessiController:", AccessiController);
console.log("AccessiModule:", AccessiModule);
console.log("AccessiControllerBase:", AccessiControllerBase);

if (
  !UserService ||
  !AuthService ||
  !PermissionService ||
  !EmailService ||
  !AccessiController ||
  !AccessiRoutes ||
  !AccessiControllerBase
) {
  throw new Error("ERRORE: Una o più dipendenze non sono state importate correttamente!");
}

// Definizione delle opzioni per AccessiModule
const accessiOptions: AccessiOptions = {
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
};

console.log("AccessiOptions inizializzato correttamente:", accessiOptions);
container.bind<AccessiOptions>("AccessiOptions").toConstantValue(accessiOptions);

console.log("Registrazione delle dipendenze...");

console.log("Binding IUserService...");
container.bind<IUserService>("IUserService").to(UserService);

console.log("Binding IAuthService...");
container.bind<IAuthService>("IAuthService").to(AuthService);

console.log("Binding IPermissionService...");
container.bind<IPermissionService>("IPermissionService").to(PermissionService);

console.log("Binding IEmailService...");
container.bind<IEmailService>("IEmailService").to(EmailService);

console.log("Binding AccessiControllerBase...");
container.bind<AccessiControllerBase>(AccessiControllerBase).to(AccessiController);

console.log("Binding AccessiRoutes...");
container.bind<IAccessiRoutes>("IAccessiRoutes").to(AccessiRoutes);

console.log("Tutte le dipendenze sono state registrate correttamente!");

export { container };
