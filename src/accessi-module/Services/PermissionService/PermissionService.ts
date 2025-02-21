
import { inject, injectable } from "inversify";
import { Orm } from "../../../Orm";
import { RestUtilities } from "../../../Utilities";
import { AccessiOptions } from "../../AccessiModule";
import { IAbilitazioneMenu, IUserService } from "../UserService/IUserService";
import { IAbilitazione, IPermissionService, IRoleWithMenus } from "./IPermissionService";
import { autobind } from "../../../autobind";
import { IAuthService } from "../AuthService/IAuthService";
import { IEmailService } from "../EmailService/IEmailService";

@injectable()
export class PermissionService implements IPermissionService {
    constructor(
        @inject("IUserService") private userService: IUserService,
        @inject("IPermissionService") private permissionService: IPermissionService,
        @inject("IEmailService") private emailService: IEmailService,
        @inject("IAuthService") private authService: IAuthService,
        @inject("AccessiOptions") private accessiOptions: AccessiOptions
    ) {}


    public async addAbilitazioni(codiceUtente: string, menuAbilitazioni: any[]): Promise<void> {
        try {
            const deleteQuery = `DELETE FROM ABILITAZIONI WHERE CODUTE = ?`;
            await Orm.execute(this.accessiOptions.databaseOptions, deleteQuery, [codiceUtente]);

            const abilitazioniToInsert = menuAbilitazioni
                .flatMap(menuGrp => menuGrp.menu)
                .filter(menu => menu.flgChk)
                .map(menu => [codiceUtente, menu.codiceMenu, menu.tipoAbilitazione]);

            const insertQuery = `UPDATE OR INSERT INTO ABILITAZIONI (CODUTE, CODMNU, TIPABI) VALUES (?, ?, ?)`;

            for (const params of abilitazioniToInsert) {
                await Orm.execute(this.accessiOptions.databaseOptions, insertQuery, params);
            }
        } catch (error) {
            throw error;
        }
    }


    public async resetAbilitazioni(codiceUtente: string): Promise<void> {
        try {
            const query = "DELETE FROM ABILITAZIONI WHERE CODUTE = ?";
            await Orm.execute(this.accessiOptions.databaseOptions, query, [codiceUtente]);
        } catch (error) {
            throw error;
        }
    }

    public async getRolesWithMenus(): Promise<IRoleWithMenus[]> {
        try {
            const query = `
                SELECT 
                    R.CODRUO AS codice_ruolo, 
                    R.DESRUO AS descrizione_ruolo, 
                    M.CODMNU AS codice_menu, 
                    M.DESMNU AS descrizione_menu
                FROM RUOLI R
                LEFT JOIN RUOLI_MNU RM ON R.CODRUO = RM.CODRUO
                LEFT JOIN MENU M ON RM.CODMNU = M.CODMNU
                ORDER BY R.CODRUO, M.CODMNU
            `;

            const result = await Orm.execute(this.accessiOptions.databaseOptions, query, []);

            const ruoliMap = new Map<number, IRoleWithMenus>();

            for (const row of result.map(RestUtilities.convertKeysToCamelCase)) {
                const codiceRuolo = row.codiceRuolo;
                if (!ruoliMap.has(codiceRuolo)) {
                    ruoliMap.set(codiceRuolo, {
                        codiceRuolo,
                        descrizioneRuolo: row.descrizioneRuolo.trim(),
                        menu: [],
                    });
                }
                if (row.codiceMenu) {
                    ruoliMap.get(codiceRuolo)!.menu.push({
                        codiceMenu: row.codiceMenu.trim(),
                        descrizioneMenu: row.descrizioneMenu.trim(),
                    });
                }
            }

            return Array.from(ruoliMap.values());
        } catch (error) {
            throw error;
        }
    }


    public async getAbilitazioniMenu(codiceUtente: string, isSuperAdmin: boolean): Promise<IAbilitazioneMenu[]> {
        const query = isSuperAdmin
            ? `SELECT 
                    M.CODMNU AS codice_menu, 
                    10 AS tipo_abilitazione, 
                    M.DESMNU AS descrizione_menu, 
                    G.DESGRP AS descrizione_gruppo, 
                    G.CODGRP AS codice_gruppo, 
                    M.ICON AS icona, 
                    M.CODTIP AS tipo, 
                    M.PAGINA AS pagina
                FROM MENU M 
                INNER JOIN MENU_GRP G ON G.CODGRP = M.CODGRP 
                WHERE M.FLGENABLED = 1 AND G.FLGENABLED = 1`
            : `SELECT 
                    A.CODMNU AS codice_menu, 
                    A.TIPABI AS tipo_abilitazione, 
                    M.DESMNU AS descrizione_menu, 
                    G.DESGRP AS descrizione_gruppo, 
                    G.CODGRP AS codice_gruppo, 
                    M.ICON AS icona, 
                    M.CODTIP AS tipo, 
                    M.PAGINA AS pagina
                FROM ABILITAZIONI A 
                INNER JOIN MENU M ON A.CODMNU = M.CODMNU 
                INNER JOIN MENU_GRP G ON G.CODGRP = M.CODGRP
                WHERE A.CODUTE = ? AND M.FLGENABLED = 1 AND G.FLGENABLED = 1`;

        return await Orm.query(this.accessiOptions.databaseOptions, query, isSuperAdmin ? [] : [codiceUtente])
            .then(results => results.map(RestUtilities.convertKeysToCamelCase)) as IAbilitazioneMenu[];
    }
}
