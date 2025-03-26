import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import { AccessiOptions } from '../../AccessiModule';
import { Orm } from '../../../Orm';
import { Inject, Injectable } from '@nestjs/common';
import { StatoRegistrazione } from '../../Dtos/StatoRegistrazione';


@Injectable()
export class EmailService {

    constructor(
        @Inject('ACCESSI_OPTIONS') private readonly accessiOptions: AccessiOptions
    ) { }

    sendAccountUpdateEmail(email: string, message: string): Promise<void> {
        throw new Error('Method not implemented.');
    }

    private transporter = nodemailer.createTransport(this.accessiOptions.emailOptions);


    public async sendPasswordResetEmail(email: string, baseUrl: string): Promise<void> {
        try {
            const resetToken = uuidv4(); // Generiamo un nuovo token unico

            // Aggiorna il campo keyReg nel database
            const result = await Orm.query(
                this.accessiOptions.databaseOptions,
                "UPDATE UTENTI SET KEYREG = ?, STAREG = ? WHERE USRNAME = ? RETURNING CODUTE",
                [resetToken, StatoRegistrazione.INVIO, email]
            );

            if (result.length === 0) {
                throw new Error("Email non trovata.");
            }

            const resetUrl = `${baseUrl}/api/accessi/email/reset-password-page/${resetToken}`;

            const mailOptions = {
                from: this.accessiOptions.emailOptions.from,
                to: email,
                subject: "Reset della tua password",
                text: `Clicca sul seguente link per resettare la tua password: ${resetUrl}`,
                html: `<p>Clicca sul seguente link per resettare la tua password:</p><a href="${resetUrl}">${resetUrl}</a>`,
            };

            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.error("Errore nell'invio dell'email di reset password:", error);
            throw new Error("Errore durante l'invio dell'email di reset password.");
        }
    }
}
