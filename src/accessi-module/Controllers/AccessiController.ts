import { Controller, Get, Post, Body, Inject, Res, Param, Req } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import * as jwt from 'jsonwebtoken';
import { RestUtilities, CryptUtilities, Deprecated } from '../../Utilities';
import { AccessiOptions } from '../AccessiModule';
import { AuthService } from '../Services/AuthService/AuthService';
import { PermissionService } from '../Services/PermissionService/PermissionService';
import { UserService } from '../Services/UserService/UserService';
import { EmailService } from '../Services/EmailService/EmailService';
import { join } from 'path';
import { User } from '../Dtos';

@Deprecated("AccessiController è deprecato. Usa i controller specifici per ogni area.")
@ApiTags('AccessiDEPRECATED')
@Controller('accessi')
export class AccessiController {
    constructor(
        private readonly userService: UserService,
        private readonly authService: AuthService,
        private readonly emailService: EmailService,
        private readonly permissionService: PermissionService,
        @Inject('ACCESSI_OPTIONS') private readonly options: AccessiOptions
    ) { }

   
    @Get('reset-password/:token')
    async serveResetPasswordPage(@Res() res: Response, @Param('token') token: string) {
        return res.sendFile(join(__dirname, '..', 'Views', 'reset-password.html'));
    }

    @Post('reset-password/:token')
    async resetPassword(@Res() res: Response, @Param('token') token: string, @Body("newPassword") newPassword: string) {
        try {
            await this.authService.confirmResetPassword(token, newPassword);
            return RestUtilities.sendOKMessage(res, 'Password aggiornata con successo!');

        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AccessiController.name);
        }
    }

    @ApiOperation({ summary: 'Recupera le informazioni utente dal token JWT', operationId: "getUserByToken" })
    @Post('get-user-by-token')
    async getUserByToken(@Body('token') token: string, @Res() res: Response) {
        try {
            if (!token) return RestUtilities.sendErrorMessage(res, 'Token non fornito', AccessiController.name);
            const decoded = jwt.verify(token, this.options.jwtOptions.secret);
            if (!decoded) return RestUtilities.sendUnauthorized(res);
            return RestUtilities.sendBaseResponse(res, { userData: decoded });
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AccessiController.name);
        }
    }

    @ApiOperation({ summary: 'Effettua il login', operationId: "login" })
    @Post('login')
    async login(@Body() loginDto: { email: string; password: string }, @Res() res: Response) {
        try {
            const userData = await this.authService.login(loginDto);
            if (!userData) return RestUtilities.sendInvalidCredentials(res);
            userData.token = {
                expiresIn: this.options.jwtOptions.expiresIn,
                value: jwt.sign({ userData }, this.options.jwtOptions.secret, { expiresIn: this.options.jwtOptions.expiresIn as any }),
                type: 'Bearer',
            };
            return RestUtilities.sendBaseResponse(res, userData);
        } catch (error) {
            return RestUtilities.sendInvalidCredentials(res);
        }
    }

    @ApiOperation({ summary: 'Recupera la lista degli utenti', operationId: "getUsers" })
    @Post('get-users')
    async getUsers(@Res() res: Response) {
        try {
            const users = await this.userService.getUsers();
            return RestUtilities.sendBaseResponse(res, users);
        } catch (error) {
            return RestUtilities.sendInvalidCredentials(res);
        }
    }

    @ApiOperation({ summary: 'Elimina un utente', operationId: "deleteUser" })
    @Post('delete-user')
    async deleteUser(@Body('codiceUtente') codiceUtente: string, @Res() res: Response) {
        try {
            if (!codiceUtente) throw new Error('Il campo "Codice Utente" è obbligatorio.');
            await this.userService.deleteUser(codiceUtente);
            return RestUtilities.sendOKMessage(res, 'L\'utente è stato eliminato con successo.');
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error);
        }
    }

    @ApiOperation({ summary: 'Registra un nuovo utente', operationId: "register" })
    @Post('register')
    async register(@Req() request: Request, @Body() registrationData: User, @Res() res: Response) {
        try {

            let protocol = request["protocol"];
            let host = request.headers["host"];

            if(!protocol || !host ){
                return RestUtilities.sendErrorMessage(res, "Impossibile procedere: protocollo e host non impostati negli header della richiesta.", AccessiController.name);
            }            
            await this.userService.register(registrationData);

            let confirmationEmailPrefix = protocol + "://"+ host;
            await this.emailService.sendPasswordResetEmail(registrationData.email, confirmationEmailPrefix);
            return RestUtilities.sendOKMessage(res, "L'utente è stato registrato con successo, email di conferma inoltrata al destinatario.");
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AccessiController.name);
        }
    }

    @ApiOperation({ summary: 'Crittografa i dati' , operationId: "encrypt"})
    @Post('encrypt')
    async encrypt(@Body('data') data: string, @Res() res: Response) {
        try {
            const encryptedData = CryptUtilities.encrypt(data, this.options.encryptionKey);
            return RestUtilities.sendBaseResponse(res, encryptedData);
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AccessiController.name);
        }
    }

    @ApiOperation({ summary: 'Decrittografa i dati', operationId: "decrypt" })
    @Post('decrypt')
    async decrypt(@Body('data') data: string, @Res() res: Response) {
        try {
            const decryptedData = CryptUtilities.decrypt(data, this.options.encryptionKey);
            return RestUtilities.sendBaseResponse(res, decryptedData);
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AccessiController.name);
        }
    }

    @ApiOperation({ summary: 'Resetta le abilitazioni di un utente', operationId: "resetAbilitazioni" })
    @Post('reset-abilitazioni')
    async resetAbilitazioni(@Body('codiceUtente') codiceUtente: string, @Res() res: Response) {
        try {
            await this.permissionService.resetAbilitazioni(codiceUtente);
            return RestUtilities.sendOKMessage(res, `Le abilitazioni dell'utente ${codiceUtente} sono state resettate con successo.`);
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AccessiController.name);
        }
    }

    @ApiOperation({ summary: 'Imposta una nuova password', operationId: "setPassword" })
    @Post('set-password')
    async setPassword(@Body() request: { codiceUtente: string; nuovaPassword: string }, @Res() res: Response) {
        try {
            await this.authService.setPassword(request.codiceUtente, request.nuovaPassword);
            return RestUtilities.sendOKMessage(res, `La password dell'utente ${request.codiceUtente} è stata impostata correttamente.`);
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AccessiController.name);
        }
    }


    @ApiOperation({ summary: 'Imposta il consenso GDPR', operationId: "setGdpr" })
    @Post('set-gdpr')
    async setGdpr(@Body('codiceUtente') codiceUtente: string, @Res() res: Response) {
        try {
            await this.userService.setGdpr(codiceUtente);
            return RestUtilities.sendOKMessage(res, `L'utente ${codiceUtente} ha accettato il GDPR.`);
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AccessiController.name);
        }
    }
}
