import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import { AccessiOptions } from '../../AccessiModule';
import { Orm } from '../../../Orm';
import { IEmailService } from './IEmailService';
import { inject, injectable } from 'inversify';


@injectable()
export class EmailService implements IEmailService {
    
    constructor(
        @inject("AccessiOptions") private accessiOptions: AccessiOptions
    ) {}

    sendPasswordResetEmail(email: string, resetToken: string, baseUrl: string): Promise<void> {
        throw new Error('Method not implemented.');
    }
    sendAccountUpdateEmail(email: string, message: string): Promise<void> {
        throw new Error('Method not implemented.');
    }

    private transporter = nodemailer.createTransport(this.accessiOptions.emailOptions);

    async sendVerificationEmail(email: string, codiceUtente: string, baseUrl: string) {
        try {
            const userKey = uuidv4();
            await Orm.query(
                this.accessiOptions.databaseOptions,
                "UPDATE UTENTI SET KEYREG = ? WHERE CODUTE = ?",
                [userKey, codiceUtente]
            );

            const verificationUrl = `${baseUrl}/${userKey}`;

            const mailOptions = {
                from: '"Supporto" <noreply@example.com>',
                to: email,
                subject: 'Verifica la tua email',
                text: `Clicca sul seguente link per verificare il tuo account: ${verificationUrl}`,
                html: `<p>Clicca sul seguente link per verificare il tuo account:</p><a href="${verificationUrl}">${verificationUrl}</a>`
            };

            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.error("Errore nell'invio dell'email di verifica:", error);
            throw new Error("Errore durante l'invio dell'email di verifica.");
        }
    }
}
