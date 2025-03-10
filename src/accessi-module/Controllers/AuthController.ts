import { Body, Controller, Inject, Param, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
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
