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


    public async sendPasswordResetEmail(email: string): Promise<void> {
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

            const returnUrlQueryParams = "?returnUrl=" + this.accessiOptions.confirmationEmailReturnUrl + "&prefix=" + (this.accessiOptions.confirmationEmailPrefix ?? '');
            const { confirmationEmailUrl } = this.accessiOptions;
            const resetUrl = `${confirmationEmailUrl}/api/accessi/email/reset-password-page/${resetToken}${returnUrlQueryParams}`;

            let sPhrase: string;
            sPhrase = ` Gentile utente,<br>
                        abbiamo ricevuto la tua richiesta.<br><br>

                        Per completare l'operazione, clicca sul link qui sotto:<br>
                        <a href="${resetUrl}">completa la procedura</a><br><br>

                        Se hai richiesto la registrazione al servizio o la reimpostazione della password, questo passaggio è necessario.<br>
                        Se non sei stato tu a effettuare questa richiesta, puoi ignorare questo messaggio in tutta sicurezza.<br><br>

                        Questa è una comunicazione automatica, ti preghiamo di non rispondere a questa email.<br><br>

                        Grazie.<br>`;
            const html = this.GetHtmlMail(sPhrase);
            const mailOptions = {
                from: this.accessiOptions.emailOptions.from,
                to: email,
                subject: "Scelta nuova password",
                text: sPhrase,
                html: html,
            };

            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.error("Errore nell'invio dell'email di reset password:", error);
            throw new Error("Errore durante l'invio dell'email di reset password.");
        }
    }

    public async sendLoginConfirmationCode(email: string, code: string): Promise<void> {
        try {
            const sPhrase = `
                Gentile utente,<br>
                ecco il suo codice di conferma per l'accesso:<br><br>
                <b>${code}</b><br><br>
                Questo codice scadrà tra 15 minuti.<br>
                Se non sei stato tu a effettuare questa richiesta, puoi ignorare questo messaggio in tutta sicurezza.<br><br>
                Questa è una comunicazione automatica, ti preghiamo di non rispondere a questa email.<br><br>
                Grazie.<br>
            `;

            const html = this.GetHtmlMail(sPhrase);
            const mailOptions = {
                from: this.accessiOptions.emailOptions.from,
                to: email,
                subject: "Codice di conferma accesso",
                text: sPhrase,
                html: html,
            };

            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.error("Errore nell'invio dell'email di conferma accesso:", error);
            throw new Error("Errore durante l'invio dell'email di conferma accesso.");
        }
    }

    private GetHtmlMail(sPhrase: string): string {
        let sTxt = '';
        sTxt += '<html xmlns="http://www.w3.org/1999/xhtml">'
        sTxt += '<head>'
        sTxt += '    <meta content="text/html; charset=utf-8" http-equiv="Content-Type">'
        sTxt += '    <meta name="viewport" content="width=device-width, initial-scale=1">'
        sTxt += '    <title></title>'
        sTxt += '    <style type="text/css">'
        sTxt += '        @media only screen and (max-width:480px) {'
        sTxt += '            body,'
        sTxt += '            table,'
        sTxt += '            td,'
        sTxt += '            p,'
        sTxt += '            a,'
        sTxt += '            li,'
        sTxt += '            blockquote {'
        sTxt += '                -webkit-text-size-adjust: none !important'
        sTxt += '            }'
        sTxt += '            body {'
        sTxt += '                width: 100% !important;'
        sTxt += '                min-width: 100% !important'
        sTxt += '            }'
        sTxt += '            #bodyCell {'
        sTxt += '                padding: 10px !important'
        sTxt += '            }'
        sTxt += '            table.kmMobileHide {'
        sTxt += '                display: none !important'
        sTxt += '            }'
        sTxt += '            table.kmDesktopOnly,'
        sTxt += '            td.kmDesktopOnly,'
        sTxt += '            th.kmDesktopOnly,'
        sTxt += '            tr.kmDesktopOnly,'
        sTxt += '            td.kmDesktopWrapHeaderMobileNone {'
        sTxt += '                display: none !important'
        sTxt += '            }'
        sTxt += '            table.kmMobileOnly {'
        sTxt += '                display: table !important'
        sTxt += '            }'
        sTxt += '            tr.kmMobileOnly {'
        sTxt += '                display: table-row !important'
        sTxt += '            }'
        sTxt += '            td.kmMobileOnly,'
        sTxt += '            td.kmDesktopWrapHeader,'
        sTxt += '            th.kmMobileOnly {'
        sTxt += '                display: table-cell !important'
        sTxt += '            }'
        sTxt += '            tr.kmMobileNoAlign,'
        sTxt += '            table.kmMobileNoAlign {'
        sTxt += '                float: none !important;'
        sTxt += '                text-align: initial !important;'
        sTxt += '                vertical-align: middle !important;'
        sTxt += '                table-layout: fixed !important'
        sTxt += '            }'
        sTxt += '            tr.kmMobileCenterAlign {'
        sTxt += '                float: none !important;'
        sTxt += '                text-align: center !important;'
        sTxt += '                vertical-align: middle !important;'
        sTxt += '                table-layout: fixed !important'
        sTxt += '            }'
        sTxt += '            td.kmButtonCollection {'
        sTxt += '                padding-left: 9px !important;'
        sTxt += '                padding-right: 9px !important;'
        sTxt += '                padding-top: 9px !important;'
        sTxt += '                padding-bottom: 9px !importan'
        sTxt += '            }'
        sTxt += '            td.kmMobileHeaderStackDesktopNone,'
        sTxt += '            img.kmMobileHeaderStackDesktopNone,'
        sTxt += '            td.kmMobileHeaderStack {'
        sTxt += '                display: block !important;'
        sTxt += '                margin-left: auto !important;'
        sTxt += '                margin-right: auto !important;'
        sTxt += '                padding-bottom: 9px !important;'
        sTxt += '                padding-right: 0 !important;'
        sTxt += '                padding-left: 0 !important'
        sTxt += '            }'
        sTxt += '            td.kmMobileWrapHeader,'
        sTxt += '            td.kmMobileWrapHeaderDesktopNone {'
        sTxt += '                display: inline-block !important'
        sTxt += '            }'
        sTxt += '            td.kmMobileHeaderSpacing {'
        sTxt += '                padding-right: 10px !important'
        sTxt += '            }'
        sTxt += '            td.kmMobileHeaderNoSpacing {'
        sTxt += '                padding-right: 0 !important'
        sTxt += '            }'
        sTxt += '            table.kmDesktopAutoWidth {'
        sTxt += '                width: inherit !important'
        sTxt += '            }'
        sTxt += '            table.kmMobileAutoWidth {'
        sTxt += '                width: 100% !important'
        sTxt += '            }'
        sTxt += '            table.kmTextContentContainer {'
        sTxt += '                width: 100% !important'
        sTxt += '            }'
        sTxt += '            table.kmBoxedTextContentContainer {'
        sTxt += '                width: 100% !important'
        sTxt += '            }'
        sTxt += '            td.kmImageContent {'
        sTxt += '                padding-left: 0 !important;'
        sTxt += '                padding-right: 0 !important'
        sTxt += '            }'
        sTxt += '            img.kmImage {'
        sTxt += '                width: 100% !important'
        sTxt += '            }'
        sTxt += '            td.kmMobileStretch {'
        sTxt += '                padding-left: 0 !important;'
        sTxt += '                padding-right: 0 !important'
        sTxt += '            }'
        sTxt += '            table.kmSplitContentLeftContentContainer,'
        sTxt += '            table.kmSplitContentRightContentContainer,'
        sTxt += '            table.kmColumnContainer,'
        sTxt += '            td.kmVerticalButtonBarContentOuter table.kmButtonBarContent,'
        sTxt += '            td.kmVerticalButtonCollectionContentOuter table.kmButtonCollectionContent,'
        sTxt += '            table.kmVerticalButton,'
        sTxt += '            table.kmVerticalButtonContent {'
        sTxt += '                width: 100% !important'
        sTxt += '            }'
        sTxt += '            td.kmButtonCollectionInner {'
        sTxt += '                padding-left: 9px !important;'
        sTxt += '                padding-right: 9px !important;'
        sTxt += '                padding-top: 9px !important;'
        sTxt += '                padding-bottom: 9px !important'
        sTxt += '            }'
        sTxt += '            td.kmVerticalButtonIconContent,'
        sTxt += '            td.kmVerticalButtonTextContent,'
        sTxt += '            td.kmVerticalButtonContentOuter {'
        sTxt += '                padding-left: 0 !important;'
        sTxt += '                padding-right: 0 !important;'
        sTxt += '                padding-bottom: 9px !important'
        sTxt += '            }'
        sTxt += '            table.kmSplitContentLeftContentContainer td.kmTextContent,'
        sTxt += '            table.kmSplitContentRightContentContainer td.kmTextContent,'
        sTxt += '            table.kmColumnContainer td.kmTextContent,'
        sTxt += '            table.kmSplitContentLeftContentContainer td.kmImageContent,'
        sTxt += '            table.kmSplitContentRightContentContainer td.kmImageContent {'
        sTxt += '                padding-top: 9px !important'
        sTxt += '            }'
        sTxt += '            td.rowContainer.kmFloatLeft,'
        sTxt += '            td.rowContainer.kmFloatLeft,'
        sTxt += '            td.rowContainer.kmFloatLeft.firstColumn,'
        sTxt += '            td.rowContainer.kmFloatLeft.firstColumn,'
        sTxt += '            td.rowContainer.kmFloatLeft.lastColumn,'
        sTxt += '            td.rowContainer.kmFloatLeft.lastColumn {'
        sTxt += '                float: left;'
        sTxt += '                clear: both;'
        sTxt += '                width: 100% !important'
        sTxt += '            }'
        sTxt += '            table.templateContainer,'
        sTxt += '            table.templateContainer.brandingContainer,'
        sTxt += '            div.templateContainer,'
        sTxt += '            div.templateContainer.brandingContainer,'
        sTxt += '            table.templateRow {'
        sTxt += '                max-width: 600px !important;'
        sTxt += '                width: 100% !important'
        sTxt += '            }'
        sTxt += '            h1 {'
        sTxt += '                font-size: 30px !important;'
        sTxt += '                line-height: 130% !important'
        sTxt += '            }'
        sTxt += '            h2 {'
        sTxt += '                font-size: 22px !important;'
        sTxt += '                line-height: 130% !important'
        sTxt += '            }'
        sTxt += '            h3 {'
        sTxt += '                font-size: 22px !important;'
        sTxt += '                line-height: 130% !important'
        sTxt += '            }'
        sTxt += '            h4 {'
        sTxt += '                font-size: 16px !important;'
        sTxt += '                line-height: 130% !important'
        sTxt += '            }'
        sTxt += '            td.kmTextContent {'
        sTxt += '                font-size: 14px !important;'
        sTxt += '                line-height: 130% !important'
        sTxt += '            }'
        sTxt += '            td.kmTextBlockInner td.kmTextContent {'
        sTxt += '                padding-right: 18px !important;'
        sTxt += '                padding-left: 18px !important'
        sTxt += '            }'
        sTxt += '            table.kmTableBlock.kmTableMobile td.kmTableBlockInner {'
        sTxt += '                padding-left: 9px !important;'
        sTxt += '                padding-right: 9px !important'
        sTxt += '            }'
        sTxt += '            table.kmTableBlock.kmTableMobile td.kmTableBlockInner .kmTextContent {'
        sTxt += '                font-size: 14px !important;'
        sTxt += '                line-height: 130% !important;'
        sTxt += '                padding-left: 4px !important;'
        sTxt += '                padding-right: 4px !important'
        sTxt += '            }'
        sTxt += '        }'
        sTxt += '    </style>'
        sTxt += '</head>'
        sTxt += '<body style="margin:0;padding:0;font-family:"Raleway", Helvetica, sans-serif;font-weight:400;letter-spacing:0.75px;line-height:180%;background-color:#F2F2F2">'
        sTxt += '    <center>'
        sTxt += '        <table align="center" border="0" cellpadding="0" cellspacing="0" id="bodyTable" width="100%" style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;padding:0;background-color:#F2F2F2;height:100%;margin:0;width:100%">'
        sTxt += '            <tbody>'
        sTxt += '                <tr>'
        sTxt += '                    <td align="center" id="bodyCell" valign="top" style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;padding-top:10px;padding-left:10px;padding-bottom:20px;padding-right:10px;border-top:0;height:100%;margin:0;width:100%">'
        sTxt += '                        <!--[if !mso]>'
        sTxt += '					<!-->'
        sTxt += '                        <div class="templateContainer" style="border:0 none #aaa;background-color:#F2F2F2;border-radius:0;display: table; width:90%">'
        sTxt += '                            <div class="templateContainerInner" style="padding:0">'
        sTxt += '                                <!--'
        sTxt += '							<![endif]-->'
        sTxt += '                                <!--[if mso]>'
        sTxt += '							<table border="0" cellpadding="0" cellspacing="0" class="templateContainer" width="90%" '
        sTxt += '                style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;">'
        sTxt += '								<tbody>'
        sTxt += '									<tr>'
        sTxt += '										<td class="templateContainerInner" style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;">'
        sTxt += '											<![endif]-->'
        sTxt += '                                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0">'
        sTxt += '                                    <tr>'
        sTxt += '                                        <td align="center" valign="top" style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0">'
        sTxt += '                                            <table border="0" cellpadding="0" cellspacing="0" class="templateRow" width="100%" style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0">'
        sTxt += '                                                <tbody>'
        sTxt += '                                                    <tr>'
        sTxt += '                                                        <td class="rowContainer kmFloatLeft" valign="top" style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0">'
        sTxt += '                                                            <table border="0" cellpadding="0" cellspacing="0" class="kmTextBlock" width="100%" style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0">'
        sTxt += '                                                                <tbody class="kmTextBlockOuter">'
        sTxt += '                                                                    <tr>'
        sTxt += '                                                                        <td class="kmTextBlockInner" valign="top" style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;background-color:#FFFFFF;">'
        sTxt += '                                                                            <table align="left" border="0" cellpadding="0" cellspacing="0" class="kmTextContentContainer" width="100%" style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0">'
        sTxt += '                                                                                <tbody>'
        sTxt += '                                                                                    <tr>'
        sTxt += '                                                                                        <td class="kmTextContent" valign="top" style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;color:#272727;font-family:Helvetica, Arial;font-size:13px;line-height:200%;letter-spacing:normal;text-align:left;padding-top:40px;padding-bottom:40px;padding-left:40px;padding-right:40px;">'
        sTxt += '                                                                                           <p>' + sPhrase + '<p>';
        sTxt += '                                                                                        </td>'
        sTxt += '                                                                                    </tr>'
        sTxt += '                                                                                </tbody>'
        sTxt += '                                                                            </table>'
        sTxt += '                                                                        </td>'
        sTxt += '                                                                    </tr>'
        sTxt += '                                                                </tbody>'
        sTxt += '                                                            </table>'
        sTxt += '                                                        </td>'
        sTxt += '                                                    </tr>'
        sTxt += '                                                </tbody>'
        sTxt += '                                            </table>'
        sTxt += '                                        </td>'
        sTxt += '                                    </tr>'
        sTxt += '                                </table>'
        sTxt += '                                <!--[if !mso]>'
        sTxt += '															<!-->'
        sTxt += '                            </div>'
        sTxt += '                        </div>'
        sTxt += '                        <!--'
        sTxt += '													<![endif]-->'
        sTxt += '                        <!--[if mso]>'
        sTxt += '												</td>'
        sTxt += '											</tr>'
        sTxt += '										</tbody>'
        sTxt += '									</table>'
        sTxt += '									<![endif]-->'
        sTxt += '                    </td>'
        sTxt += '                </tr>'
        sTxt += '            </tbody>'
        sTxt += '        </table>'
        sTxt += '    </center>'
        sTxt += '</body>'
        sTxt += '</html> '

        return sTxt;
    }

}
