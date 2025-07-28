import { Body, Controller, Get, Inject, Param, Post, Query, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { join } from 'path';
import { RestUtilities } from '../../Utilities';
import { AccessiOptions } from '../AccessiModule';
import { EmailService } from '../Services/EmailService/EmailService';
import { IsOptional } from 'class-validator';
@ApiTags('Email')
@Controller('accessi/email')
export class EmailController {
    constructor(
        private readonly emailService: EmailService,
        @Inject('ACCESSI_OPTIONS') private readonly options: AccessiOptions
    ) { }

    @ApiOperation({ summary: 'Serve una pagina per il reset della password', operationId: "serveResetPasswordPage" })
    @ApiParam({ name: 'token', description: 'Token per il reset della password', required: true })
    @ApiQuery({ name: 'returnUrl', description: 'Url di ritorno della pagina. Default: https://google.com', required: false })
    @ApiResponse({ status: 200, description: 'Pagina di reset password servita con successo' })
    @Get('reset-password-page/:token')
    async serveResetPasswordPage(@Res() res: Response, @Param('token') token: string, @Query('returnUrl') returnUrl?: string) {
        return res.sendFile(join(__dirname, '..', 'Views', 'reset-password.html'));
    }

    @ApiOperation({ summary: 'Invia una e-mail per il reset della password', operationId: "sendPasswordResetEmail" })
    @ApiBody({ schema: { properties: {
         email: { 
            type: 'string',
            description: "L'email dell'utente che richiede il reset" 
         },
         resetCustomUrl: {
            type: 'string',
            description: "Pagina di reset della password personalizzata",
         },
         htmlMail: {
            type: 'string',
            description: 'Corpo della mail in HTML'
         }
        },
        required: ['email']
    } })
    @ApiResponse({ status: 200, description: "L'email di reset è stata inviata con successo" })
    @ApiResponse({ status: 400, description: "Errore nella richiesta: protocollo o host non impostati" })
    @ApiResponse({ status: 500, description: "Errore interno durante l'invio dell'email" })
    @Post('send-reset-password-email')
    async sendPasswordResetEmail(
        @Req() request: Request, 
        @Body() sendResetPasswordData: { 
            email: string, 
            resetUrlCustom?: string, 
            htmlMail?: string 
        }, 
        @Res() res: Response) {
        try {

            await this.emailService.sendPasswordResetEmail(
                sendResetPasswordData.email,
                sendResetPasswordData.resetUrlCustom,
                sendResetPasswordData.htmlMail
            );
            return RestUtilities.sendOKMessage(res, "L'email di reset è stata inoltrata al destinatario.");
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, EmailController.name);
        }
    }
}
