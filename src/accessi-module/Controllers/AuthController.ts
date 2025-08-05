import { Body, Controller, Inject, Param, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { RestUtilities } from '../../Utilities';
import { AccessiOptions } from '../AccessiModule';
import { AuthService } from '../Services/AuthService/AuthService';
import { LoginRequest, LoginResponse } from '../Dtos';
import { Logger } from '../../Logger';
import { ApiProperty } from '@nestjs/swagger';

class TelegramLoginRequest {
  @ApiProperty()
  email: string;

  @ApiProperty()
  telegramId: string;
}

class VerifyTelegramOtpRequest {
  @ApiProperty()
  email: string;

  @ApiProperty()
  telegramId: string;

  @ApiProperty()
  otp: string;
}

@ApiTags('Auth')
@Controller('accessi/auth')
export class AuthController {

  logger: Logger = new Logger(AuthController.name);
    constructor(
        private readonly authService: AuthService,
        @Inject('ACCESSI_OPTIONS') private readonly options: AccessiOptions
    ) { }

    @ApiOperation({ summary: 'Conferma il reset della password', operationId: "resetPassword" })
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

    @ApiOperation({ summary: 'Recupera le informazioni utente dal token JWT', operationId: "getUserByToken" })
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

  @ApiOperation({
    summary: 'Effettua il login utente',
    description: 'Autentica l\'utente con email e password. Restituisce un token JWT e i dati dell\'utente se le credenziali sono corrette.',
    operationId: 'login',
  })
  @ApiBody({ type: LoginRequest })
  @ApiResponse({
    status: 200,
    description: 'Login effettuato con successo',
    type: LoginResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Credenziali non valide',
  })
  @Post('login')
  async login(@Body() loginRequest: LoginRequest, @Res() res: Response) {
    try {
      
      const userData = await this.authService.login(loginRequest);
      if (!userData) {
        return RestUtilities.sendInvalidCredentials(res);
      }

      userData.token = {
        expiresIn: this.options.jwtOptions.expiresIn,
        value: jwt.sign({ ...userData }, this.options.jwtOptions.secret, {
          expiresIn: this.options.jwtOptions.expiresIn as any,
        }),
        type: 'Bearer',
      };

      return RestUtilities.sendBaseResponse(res, userData);
    } catch (error) {
      this.logger.error('Errore durante il login', error);
      return RestUtilities.sendInvalidCredentials(res);
    }
  }

  @ApiOperation({
    summary: 'Login o avvio associazione per utente Telegram',
    description: "Controlla se l'ID Telegram è già associato. Se lo è, l'accesso è confermato. Altrimenti, invia un codice OTP all'email dell'utente per la verifica.",
    operationId: 'telegramLogin',
  })
  @ApiBody({ type: TelegramLoginRequest })
  @ApiResponse({
    status: 200,
    description: "Operazione completata. Il campo 'otpRequired' indica se l'utente deve procedere con la verifica.",
  })
  @Post('telegram-login')
  async telegramLogin(@Body() loginRequest: TelegramLoginRequest, @Res() res: Response) {
    try {
      if (!loginRequest.email || !loginRequest.telegramId) {
        throw new Error("I campi 'email' e 'telegramId' sono obbligatori.");
      }
      const result = await this.authService.telegramLogin(loginRequest.email, loginRequest.telegramId);
      return RestUtilities.sendBaseResponse(res, result);
    } catch (error) {
      this.logger.error("Errore durante il login Telegram", error);
      return RestUtilities.sendErrorMessage(res, error, AuthController.name);
    }
  }

  @ApiOperation({
    summary: 'Verifica il codice OTP e completa l\'associazione Telegram',
    description: "Verifica l'OTP ricevuto via email. Se corretto, associa l'ID Telegram all'account dell'utente.",
    operationId: 'verifyTelegramOtp',
  })
  @ApiBody({ type: VerifyTelegramOtpRequest })
  @ApiResponse({
    status: 200,
    description: 'ID Telegram associato con successo.',
  })
  @ApiResponse({
    status: 401,
    description: 'Codice non valido o scaduto.',
  })
  @Post('verify-telegram-otp')
  async verifyTelegramOtp(@Body() verifyRequest: VerifyTelegramOtpRequest, @Res() res: Response) {
    try {
      if (!verifyRequest.email || !verifyRequest.telegramId || !verifyRequest.otp) {
        throw new Error("I campi 'email', 'telegramId' e 'otp' sono obbligatori.");
      }
      await this.authService.verifyTelegramOtp(verifyRequest.email, verifyRequest.telegramId, verifyRequest.otp);
      return RestUtilities.sendOKMessage(res, "ID Telegram associato con successo.");
    } catch (error) {
      this.logger.error("Errore durante la verifica dell'OTP Telegram", error);
      return RestUtilities.sendInvalidCredentials(res);
    }
  }
}
