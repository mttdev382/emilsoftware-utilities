import { Controller, Get, Post, Body, Inject, Res, Param, Req, Delete, Put, Patch, HttpStatus, Query, ParseBoolPipe } from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiCreatedResponse, ApiQuery } from '@nestjs/swagger';
import { RestUtilities } from '../../Utilities';
import { AccessiOptions } from '../AccessiModule';
import { UserService } from '../Services/UserService/UserService';
import { EmailService } from '../Services/EmailService/EmailService';
import { join } from 'path';
import { GetUsersResponse } from '../Dtos/GetUsersResponse';
import { UserDto } from '../Dtos';
import { RegisterResponse } from '../Dtos/RegisterResponse';
import { RegisterRequest } from '../Dtos/RegisterRequest';
import { Logger } from '../../Logger';
import { PermissionService } from '../Services/PermissionService/PermissionService';

@ApiTags('User')
@Controller('accessi/user')
export class UserController {

    private readonly logger = new Logger(UserController.name);

    constructor(
        private readonly userService: UserService,
        private readonly emailService: EmailService,
        private readonly permissionService: PermissionService,
        @Inject('ACCESSI_OPTIONS') private readonly options: AccessiOptions
    ) { }

    @ApiOperation({ summary: 'Recupera le abilitazioni di Telegram per un utente', operationId: "getTelegramPermissionsByEmail" })
    @ApiResponse({ status: 200, description: 'Abilitazioni recuperate con successo' })
    @ApiResponse({ status: 404, description: 'Utente non trovato' })
    @Get('by-email/:email/telegram-permissions')
    async getTelegramPermissionsByEmail(@Param('email') email: string, @Res() res: Response) {
        try {
            const permissions = await this.permissionService.getTelegramPermissionsByEmail(email);
            return RestUtilities.sendBaseResponse(res, permissions);
        } catch (error) {
            this.logger.error('Errore durante il recupero delle abilitazioni di Telegram', error);
            return RestUtilities.sendErrorMessage(res, error, UserController.name);
        }
    }

    @ApiOperation({ summary: 'Servire la pagina di reset password', operationId: "serveResetPasswordPageUser" })
    @ApiParam({ name: 'token', description: 'Token per il reset della password', required: true })
    @Get('reset-password/:token')
    async serveResetPasswordPage(@Res() res: Response, @Param('token') token: string) {
        return res.sendFile(join(__dirname, '..', 'Views', 'reset-password.html'));
    }

    @ApiOperation({ summary: 'Recupera la lista degli utenti', operationId: "getUsers" })
    @ApiResponse({ status: 200, description: 'Lista utenti recuperata con successo', type: GetUsersResponse })
    @ApiResponse({ status: 401, description: 'Credenziali non valide' })
    @ApiQuery({ name: 'email', required: false, description: 'Email dell\'utente da cercare' })
    @ApiQuery({ name: 'codiceUtente', required: false, description: "Codice dell'utente da cercare" })
    @ApiQuery({ name: 'includeExtensionFields', required: false, description: "Includi extension fields (chiamata più pesante)" })
    @ApiQuery({ name: 'includeGrants', required: false, description: "Includi Permessi (chiamata più pesante)" })
    @Get('get-users')
    async getUsers(
        @Res() res: Response,
        @Query('email') email?: string,
        @Query('codiceUtente') codiceUtente?: number,
        @Query('includeExtensionFields', new ParseBoolPipe({ optional: true })) includeExtensionFields?: boolean,
        @Query('includeGrants', new ParseBoolPipe({ optional: true })) includeGrants?: boolean
    ) {
        try {
            let filters = { email, codiceUtente };
            let options = { includeExtensionFields: includeExtensionFields ?? true, includeGrants: includeGrants ?? true };
            const users = await this.userService.getUsers(filters, options);
            return RestUtilities.sendBaseResponse(res, users);
        } catch (error) {
            this.logger.error('Errore durante il recupero degli utenti: ', error);
            return RestUtilities.sendErrorMessage(res, error, UserController.name);
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

    @ApiOperation({
        summary: 'Registra un nuovo utente',
        operationId: 'register',
    })
    @ApiBody({
        type: RegisterRequest,
        description: "Dati necessari per la registrazione dell'utente"
    })
    @ApiCreatedResponse({
        description: 'Utente registrato con successo. Restituisce il codice utente e invia una mail di conferma/reset password.',
        type: RegisterResponse
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Errore nella registrazione. Potrebbe essere dovuto a dati mancanti, email già esistente o configurazione non valida.'
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Errore interno del server durante la registrazione o l’invio dell’email.'
    })
    @Post('register')
    async register(
        @Req() request: Request,
        @Body() registrationData: RegisterRequest,
        @Res() res: Response
    ) {
        try {
            const codiceUtente = await this.userService.register(registrationData);
            await this.emailService.sendPasswordResetEmail(registrationData.email);

            return RestUtilities.sendBaseResponse(res, codiceUtente);
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, UserController.name, HttpStatus.BAD_REQUEST);
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
        type: UserDto,
        description: "Dati aggiornati dell'utente (escluso il codice utente, che è nel path)"
    })
    @ApiResponse({ status: HttpStatus.OK, description: "Utente aggiornato con successo" })
    @ApiResponse({ status: 400, description: "Errore nell'aggiornamento" })
    @Put('update-user/:codiceUtente')
    async updateUtente(
        @Param('codiceUtente') codiceUtente: number,
        @Body() user: UserDto,
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
