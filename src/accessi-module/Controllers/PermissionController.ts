import { Body, Controller, Get, Inject, Param, Post, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { join } from 'path';
import { CryptUtilities, RestUtilities } from '../../Utilities';
import { AccessiOptions } from '../AccessiModule';
import { PermissionService } from '../Services/PermissionService/PermissionService';
import { IUser } from '../Services/UserService/IUserService';


@ApiTags('Permission')
@Controller('accessi/permission')
export class PermissionController {
    constructor(
        private readonly permissionService: PermissionService,
        @Inject('ACCESSI_OPTIONS') private readonly options: AccessiOptions
    ) { }

    
    @ApiOperation({ summary: 'Resetta le abilitazioni di un utente' })
    @Post('reset-abilitazioni')
    async resetAbilitazioni(@Body('codiceUtente') codiceUtente: string, @Res() res: Response) {
        try {
            await this.permissionService.resetAbilitazioni(codiceUtente);
            return RestUtilities.sendOKMessage(res, `Le abilitazioni dell'utente ${codiceUtente} sono state resettate con successo.`);
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, PermissionController.name);
        }
    }

}
