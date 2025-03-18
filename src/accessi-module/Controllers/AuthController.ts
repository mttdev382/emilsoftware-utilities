import { Body, Controller, Inject, Param, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { RestUtilities } from '../../Utilities';
import { AccessiOptions } from '../AccessiModule';
import { AuthService } from '../Services/AuthService/AuthService';

@ApiTags('Auth')
@Controller('accessi/auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        @Inject('ACCESSI_OPTIONS') private readonly options: AccessiOptions
    ) { }

    @ApiOperation({ summary: 'Conferma il reset della password' })
    @ApiParam({ name: 'token', description: 'Token per il reset della password', required: true })
    @ApiBody({ schema: { properties: { newPassword: { type: 'string', description: 'Nuova password da impostare' } } } })
    @ApiResponse({ status: 200, description: 'Password aggiornata con successo' })
    @ApiResponse({ status: 400, description: 'Errore nella richiesta o token non valido' })
    @Post('confirm-reset-password/:token')
    async resetPassword(@Res() res: Response, @Param('token') token: string, @Body("newPassword") newPassword: string) {
        try {
            await this.authService.confirmResetPassword(token, newPassword);
            return RestUtilities.sendOKMessage(res, 'Password aggiornata con successo!');
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AuthController.name);
        }
    }

    @ApiOperation({ summary: 'Recupera le informazioni utente dal token JWT' })
    @ApiBody({ schema: { properties: { token: { type: 'string', description: 'JWT dell\'utente' } } } })
    @ApiResponse({ status: 200, description: 'Informazioni utente recuperate con successo' })
    @ApiResponse({ status: 401, description: 'Token non valido o scaduto' })
    @Post('get-user-by-token')
    async getUserByToken(@Body('token') token: string, @Res() res: Response) {
        try {
            if (!token) return RestUtilities.sendErrorMessage(res, 'Token non fornito', AuthController.name);
            const decoded = jwt.verify(token, this.options.jwtOptions.secret);
            if (!decoded) return RestUtilities.sendUnauthorized(res);
            return RestUtilities.sendBaseResponse(res, { userData: decoded });
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AuthController.name);
        }
    }

    @ApiOperation({ summary: 'Effettua il login' })
    @ApiBody({ schema: { 
        properties: { 
            username: { type: 'string', description: 'Username dell\'utente' }, 
            password: { type: 'string', description: 'Password dell\'utente' } 
        } 
    }})
    @ApiResponse({ status: 200, description: 'Login effettuato con successo' })
    @ApiResponse({ status: 401, description: 'Credenziali non valide' })
    @Post('login')
    async login(@Body() loginDto: { username: string; password: string }, @Res() res: Response) {
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
}
