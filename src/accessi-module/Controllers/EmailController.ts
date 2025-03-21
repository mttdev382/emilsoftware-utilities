import { Body, Controller, Get, Inject, Param, Post, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { join } from 'path';
import { RestUtilities } from '../../Utilities';
import { AccessiOptions } from '../AccessiModule';
import { EmailService } from '../Services/EmailService/EmailService';
import { AccessiController } from './AccessiController';

@ApiTags('Email')
@Controller('accessi/email')
export class EmailController {
    constructor(
        private readonly emailService: EmailService,
        @Inject('ACCESSI_OPTIONS') private readonly options: AccessiOptions
    ) { }

    @ApiOperation({ summary: 'Serve una pagina per il reset della password', operationId: "serveResetPasswordPage" })
    @ApiParam({ name: 'token', description: 'Token per il reset della password', required: true })
    @ApiResponse({ status: 200, description: 'Pagina di reset password servita con successo' })
    @Get('reset-password-page/:token')
    async serveResetPasswordPage(@Res() res: Response, @Param('token') token: string) {
        return res.sendFile(join(__dirname, '..', 'Views', 'reset-password.html'));
    }

    @ApiOperation({ summary: 'Invia una e-mail per il reset della password', operationId: "sendPasswordResetEmail" })
    @ApiBody({ schema: { properties: { email: { type: 'string', description: "L'email dell'utente che richiede il reset" } } } })
    @ApiResponse({ status: 200, description: "L'email di reset è stata inviata con successo" })
    @ApiResponse({ status: 400, description: "Errore nella richiesta: protocollo o host non impostati" })
    @ApiResponse({ status: 500, description: "Errore interno durante l'invio dell'email" })
    @Post('send-reset-password-email')
    async sendPasswordResetEmail(@Req() request: Request, @Body() sendResetPasswordData: { email: string }, @Res() res: Response) {
        try {
            let protocol = request["protocol"];
            let host = request.headers["host"];

            if (!protocol || !host) {
                return RestUtilities.sendErrorMessage(res, "Impossibile procedere: protocollo e host non impostati negli header della richiesta.", AccessiController.name);
            }

            let confirmationEmailPrefix = `${protocol}://${host}`;
            await this.emailService.sendPasswordResetEmail(sendResetPasswordData.email, confirmationEmailPrefix);
            return RestUtilities.sendOKMessage(res, "L'email di reset è stata inoltrata al destinatario.");
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AccessiController.name);
        }
    }
}
