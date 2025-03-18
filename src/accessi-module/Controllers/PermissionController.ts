import { Body, Controller, Get, HttpStatus, Inject, Param, Post, Put, Res } from '@nestjs/common';
import { ApiBody, ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { RestUtilities } from '../../Utilities';
import { AccessiOptions } from '../AccessiModule';
import { PermissionService } from '../Services/PermissionService/PermissionService';
import { RoleWithMenus } from '../Dtos/RoleWithMenus';
import { AssignRolesToUserRequest } from '../Dtos/AssignRolesToUserRequest';
import { AssignPermissionsToUserRequest } from '../Dtos/AssignPermissionsToUserRequest';


@ApiTags('Permission')
@Controller('accessi/permission')
export class PermissionController {
    constructor(
        private readonly permissionService: PermissionService,
        @Inject('ACCESSI_OPTIONS') private readonly options: AccessiOptions
    ) { }

    /*
        @ApiOperation({ summary: 'Resetta le abilitazioni di un utente' })
        @Post('reset-abilitazioni')
        async resetAbilitazioni(@Body('codiceUtente') codiceUtente: string, @Res() res: Response) {
            try {
                await this.permissionService.resetAbilitazioni(codiceUtente);
                RestUtilities.sendOKMessage(res, `Le abilitazioni dell'utente ${codiceUtente} sono state resettate con successo.`);
            } catch (error) {
                RestUtilities.sendErrorMessage(res, error, PermissionController.name);
                throw error;
            }
        }
    */


    /**
     * @description Endpoint per ottenere tutti i ruoli con i relativi menù.
     * @returns Un array di ruoli con menù associati.
     */
    @ApiOperation({ summary: 'Ritorna i ruoli disponibili con i relativi menù', description: 'Recupera tutti i ruoli presenti nel sistema con le relative voci di menu accessibili.' })
    @ApiOkResponse({ description: 'Elenco dei ruoli con i rispettivi menù', type: [RoleWithMenus] })
    @ApiInternalServerErrorResponse({ description: 'Errore interno del server' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Lista dei ruoli con i menù restituita con successo.' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Errore interno del server durante il recupero dei ruoli.' })
    @Get('roles')
    async getRoles(@Res() res: Response): Promise<void> {
        try {
            const roles = await this.permissionService.getRolesWithMenus();
            RestUtilities.sendBaseResponse(res, roles);
        } catch (error) {
            RestUtilities.sendErrorMessage(res, error, PermissionController.name);
            throw error;
        }
    }

    @ApiOperation({ summary: 'Aggiorna un ruolo esistente' })
    @ApiResponse({ status: 200, description: 'Il ruolo è stato aggiornato con successo' })
    @ApiResponse({ status: 400, description: 'Errore di validazione nei dati inviati' })
    @ApiResponse({ status: 500, description: 'Errore interno del server' })
    @ApiBody({
        description: 'Dati del ruolo da aggiornare',
        required: true,
        type: RoleWithMenus
    })
    @Put('update-role')
    async updateRole(@Res() res: Response, @Body() role: RoleWithMenus) {
        try {
            if (!role) throw new Error("Il ruolo non può essere vuoto.");
            if (!role.codiceRuolo) throw new Error("Il codice del ruolo non può essere vuoto.");
            if (!role.descrizioneRuolo) throw new Error("La descrizione del ruolo non può essere vuota.");
            if (!role.menu || role.menu.length === 0) throw new Error("Il ruolo deve avere almeno un menù.");

            await this.permissionService.updateOrInsertRole(role);
            return RestUtilities.sendOKMessage(res, "Il ruolo è stato aggiornato con successo.");
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, PermissionController.name);
        }
    }

    @ApiOperation({ summary: 'Crea un nuovo ruolo' })
    @ApiResponse({ status: 201, description: 'Il ruolo è stato creato con successo' })
    @ApiResponse({ status: 400, description: 'Errore di validazione nei dati inviati' })
    @ApiResponse({ status: 500, description: 'Errore interno del server' })
    @ApiBody({
        description: 'Dati del nuovo ruolo',
        required: true,
        type: RoleWithMenus
    })
    @Post('create-role')
    async createRole(@Res() res: Response, @Body() role: RoleWithMenus) {
        try {
            if (!role) throw new Error("Il ruolo non può essere vuoto.");
            if (!role.descrizioneRuolo) throw new Error("La descrizione del ruolo non può essere vuota.");
            if (!role.menu || role.menu.length === 0) throw new Error("Il ruolo deve avere almeno un menù.");

            await this.permissionService.updateOrInsertRole(role);
            return RestUtilities.sendOKMessage(res, "Il ruolo è stato creato con successo.");
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, PermissionController.name);
        }
    }



    
    @ApiOperation({ summary: 'Assegna più ruoli a un utente' })
    @ApiParam({
        name: 'codiceUtente',
        description: 'Codice identificativo dell\'utente a cui assegnare i ruoli',
        required: true,
        example: 'USR123'
    })
    @ApiBody({
        type: AssignRolesToUserRequest,
        description: 'Lista dei ruoli da assegnare all\'utente'
    })
    @ApiResponse({ status: 200, description: 'Ruoli assegnati con successo all\'utente' })
    @ApiResponse({ status: 400, description: 'Errore di validazione nei dati inviati' })
    @ApiResponse({ status: 500, description: 'Errore interno del server' })
    @Post('assign-roles/:codiceUtente')
    async assignRolesToUser(
        @Res() res: Response,
        @Param('codiceUtente') codiceUtente: string,
        @Body() assignRolesRequest: AssignRolesToUserRequest
    ) {
        try {
            if (!codiceUtente) throw new Error("Il codice utente è obbligatorio.");
            if (!assignRolesRequest.roles || assignRolesRequest.roles.length === 0) {
                throw new Error("È necessario fornire almeno un ruolo.");
            }

            await this.permissionService.assignRolesToUser(codiceUtente, assignRolesRequest.roles);
            return RestUtilities.sendOKMessage(res, `I ruoli ${assignRolesRequest.roles.join(', ')} sono stati assegnati all'utente ${codiceUtente}.`);
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, PermissionController.name);
        }
    }





    @ApiOperation({ summary: 'Assegna abilitazioni dirette a un utente' })
    @ApiParam({
        name: 'codiceUtente',
        description: 'Codice identificativo dell\'utente a cui assegnare le abilitazioni',
        required: true,
        example: 'USR123'
    })
    @ApiBody({
        type: AssignPermissionsToUserRequest,
        description: 'Lista delle abilitazioni da assegnare all\'utente'
    })
    @ApiResponse({ status: 200, description: 'Abilitazioni assegnate con successo all\'utente' })
    @ApiResponse({ status: 400, description: 'Errore di validazione nei dati inviati' })
    @ApiResponse({ status: 500, description: 'Errore interno del server' })
    @Post('assign-permissions/:codiceUtente')
    async assignPermissionsToUser(
        @Res() res: Response,
        @Param('codiceUtente') codiceUtente: string,
        @Body() assignPermissionsRequest: AssignPermissionsToUserRequest
    ) {
        try {
            if (!codiceUtente) throw new Error("Il codice utente è obbligatorio.");
            if (!assignPermissionsRequest.permissions || assignPermissionsRequest.permissions.length === 0) {
                throw new Error("È necessario fornire almeno un'abilitazione.");
            }

            await this.permissionService.assignPermissionsToUser(codiceUtente, assignPermissionsRequest.permissions);
            return RestUtilities.sendOKMessage(res, `Le abilitazioni sono state assegnate all'utente ${codiceUtente}.`);
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, PermissionController.name);
        }
    }
}
