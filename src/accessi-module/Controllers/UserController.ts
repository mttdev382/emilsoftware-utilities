import { Controller, Get, Post, Body, Inject, Res, Param, Req, Delete, Put, Patch } from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { RestUtilities } from '../../Utilities';
import { AccessiOptions } from '../AccessiModule';
import { UserService } from '../Services/UserService/UserService';
import { EmailService } from '../Services/EmailService/EmailService';
import { join } from 'path';
import { User } from '../Dtos';
import { GetUsersResponse } from '../Dtos/GetUsersResponse';

@ApiTags('User')
@Controller('accessi/user')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly emailService: EmailService,
        @Inject('ACCESSI_OPTIONS') private readonly options: AccessiOptions
    ) { }

    @ApiOperation({ summary: 'Servire la pagina di reset password', operationId: "serveResetPasswordPage" })
    @ApiParam({ name: 'token', description: 'Token per il reset della password', required: true })
    @Get('reset-password/:token')
    async serveResetPasswordPage(@Res() res: Response, @Param('token') token: string) {
        return res.sendFile(join(__dirname, '..', 'Views', 'reset-password.html'));
    }

    @ApiOperation({ summary: 'Recupera la lista degli utenti', operationId: "getUsers" })
    @ApiResponse({ status: 200, description: 'Lista utenti recuperata con successo', type: [GetUsersResponse] })
    @ApiResponse({ status: 401, description: 'Credenziali non valide' })
    @Get('get-users')
    async getUsers(@Res() res: Response) {
        try {
            const users = await this.userService.getUsers();
            return RestUtilities.sendBaseResponse(res, users);
        } catch (error) {
            return RestUtilities.sendInvalidCredentials(res);
        }
    }

    @ApiOperation({ summary: 'Elimina un utente', operationId: "deleteUser" })
    @ApiParam({
        name: 'codiceUtente',
        description: "Codice identificativo dell'utente da eliminare",
        required: true,
        example: "USR123"
    })
    @ApiResponse({ status: 200, description: "Utente eliminato con successo" })
    @ApiResponse({ status: 400, description: "Errore nei parametri della richiesta" })
    @ApiResponse({ status: 500, description: "Errore interno del server" })
    @Delete('delete-user/:codiceUtente')
    async deleteUser(@Param('codiceUtente') codiceUtente: number, @Res() res: Response) {
        try {
            if (!codiceUtente) throw new Error('Il campo "Codice Utente" è obbligatorio.');

            await this.userService.deleteUser(codiceUtente);
            return RestUtilities.sendOKMessage(res, "L'utente è stato eliminato con successo.");
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error);
        }
    }

    @ApiOperation({ summary: 'Registra un nuovo utente', operationId: "register" })
    @ApiBody({ type: User, description: 'Dati dell\'utente da registrare' })
    @ApiResponse({ status: 201, description: 'Utente registrato con successo' })
    @ApiResponse({ status: 400, description: 'Errore nella registrazione' })
    @Post('register')
    async register(@Req() request: Request, @Body() registrationData: User, @Res() res: Response) {
        try {
            let protocol = request["protocol"];
            let host = request.headers["host"];
            if (!protocol || !host) {
                throw new Error("Impossibile procedere: protocollo e host non impostati negli header della richiesta.");
            }
            await this.userService.register(registrationData);
            let confirmationEmailPrefix = `${protocol}://${host}`;
            await this.emailService.sendPasswordResetEmail(registrationData.email, confirmationEmailPrefix);
            return RestUtilities.sendOKMessage(res, "L'utente è stato registrato con successo, email di conferma inoltrata al destinatario.");
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, UserController.name);
        }
    }

    @ApiOperation({ summary: 'Aggiorna un utente esistente', operationId: "updateUtente" })
    @ApiParam({
        name: 'codiceUtente',
        description: "Codice identificativo dell'utente da aggiornare",
        required: true,
        example: "USR123"
    })
    @ApiBody({
        type: User,
        description: "Dati aggiornati dell'utente (escluso il codice utente, che è nel path)"
    })
    @ApiResponse({ status: 200, description: "Utente aggiornato con successo" })
    @ApiResponse({ status: 400, description: "Errore nell'aggiornamento" })
    @Put('update-user/:codiceUtente')
    async updateUtente(
        @Param('codiceUtente') codiceUtente: number,
        @Body() user: User,
        @Res() res: Response
    ) {
        try {
            if (!codiceUtente) throw new Error("Il codice utente è obbligatorio.");
            
            await this.userService.updateUser(codiceUtente, user);
            return RestUtilities.sendOKMessage(res, `L'utente ${codiceUtente} è stato aggiornato con successo.`);
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, UserController.name);
        }
    }

    @ApiOperation({ summary: "Imposta il consenso GDPR per un utente", operationId: "setGdpr" })
    @ApiParam({
        name: "codiceUtente",
        description: "Codice identificativo dell'utente che accetta il GDPR",
        required: true,
        example: "USR123"
    })
    @ApiResponse({ status: 200, description: "Consenso GDPR impostato con successo" })
    @ApiResponse({ status: 400, description: "Errore nella richiesta" })
    @Patch('set-gdpr/:codiceUtente')
    async setGdpr(@Param('codiceUtente') codiceUtente: number, @Res() res: Response) {
        try {
            if (!codiceUtente) throw new Error("Il codice utente è obbligatorio.");
            
            await this.userService.setGdpr(codiceUtente);
            return RestUtilities.sendOKMessage(res, `L'utente ${codiceUtente} ha accettato il GDPR.`);
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, UserController.name);
        }
    }
}
