
import { Orm } from "../../../Orm";
import { RestUtilities } from "../../../Utilities";
import { AccessiOptions } from "../../AccessiModule";
import { Permission, TipoAbilitazione } from "../../Dtos";
import { AbilitazioneMenu } from "../../Dtos/AbilitazioneMenu";
import { MenuEntity } from "../../Dtos/GetMenusResponse";
import { Role } from "../../Dtos/Role";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class PermissionService {
    constructor(
        @Inject('ACCESSI_OPTIONS') private readonly accessiOptions: AccessiOptions
    ) { }


    public async addAbilitazioni(codiceUtente: number, menuAbilitazioni: any[]): Promise<void> {
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


    public async resetAbilitazioni(codiceUtente: number): Promise<void> {
        try {
            const query = "DELETE FROM ABILITAZIONI WHERE CODUTE = ?";
            await Orm.execute(this.accessiOptions.databaseOptions, query, [codiceUtente]);
        } catch (error) {
            throw error;
        }
    }

    public async updateOrInsertRole(role: Role, codiceRuolo: string = null): Promise<void> {
        try {

            // creazione nuovo ruolo
            if (!codiceRuolo) {
                let createRoleQuery = `INSERT INTO RUOLI (DESRUO) VALUES (?) RETURNING CODRUO`;
                let result = await Orm.query(this.accessiOptions.databaseOptions, createRoleQuery, [role.descrizioneRuolo]);

                codiceRuolo = result[0].CODRUO;


            } else
            // aggiornamento ruolo esistente
            {

                let updateRoleQuery = `UPDATE RUOLI SET DESRUO = ? WHERE CODRUO = ?`;
                await Orm.query(this.accessiOptions.databaseOptions, updateRoleQuery, [role.descrizioneRuolo, codiceRuolo]);

                let deleteRoleMenuQuery = `DELETE FROM RUOLI_MNU WHERE CODRUO = ?`;
                await Orm.query(this.accessiOptions.databaseOptions, deleteRoleMenuQuery, [codiceRuolo]);
            }

            let createRoleMenuQuery = `INSERT INTO RUOLI_MNU (CODRUO, CODMNU, TIPABI) VALUES (?, ?, ?)`;
            for (let menu of role.menu) {
                await Orm.query(this.accessiOptions.databaseOptions, createRoleMenuQuery, [codiceRuolo, menu.codiceMenu, menu.tipoAbilitazione]);
            }

        } catch (error: any) {
            throw error;
        }
    }


    public async getRolesWithMenus(): Promise<Role[]> {
        try {
            const query = `
                SELECT 
                    R.CODRUO AS codice_ruolo, 
                    R.DESRUO AS descrizione_ruolo, 
                    M.CODMNU AS codice_menu, 
                    M.DESMNU AS descrizione_menu,
                    RM.TIPABI AS tipo_abilitazione
                FROM RUOLI R
                LEFT JOIN RUOLI_MNU RM ON R.CODRUO = RM.CODRUO
                LEFT JOIN MENU M ON RM.CODMNU = M.CODMNU
                ORDER BY R.CODRUO, M.CODMNU
            `;

            let result = await Orm.query(this.accessiOptions.databaseOptions, query, []);
            result = result.map(RestUtilities.convertKeysToCamelCase);

            const ruoliMap = new Map<number, Role>();

            for (const row of result) {
                const { codiceRuolo, descrizioneRuolo, codiceMenu, descrizioneMenu, tipoAbilitazione } = row;

                if (!ruoliMap.has(codiceRuolo)) {
                    ruoliMap.set(codiceRuolo, {
                        codiceRuolo,
                        descrizioneRuolo: descrizioneRuolo?.trim(),
                        menu: []
                    });
                }

                if (codiceMenu) {
                    ruoliMap.get(codiceRuolo)!.menu.push({
                        codiceMenu: codiceMenu.trim(),
                        tipoAbilitazione,
                        descrizioneMenu: descrizioneMenu?.trim()
                    });
                }
            }

            return Array.from(ruoliMap.values());
        } catch (error) {
            throw error;
        }
    }


    public async assignRolesToUser(codiceUtente: number, roles: string[]): Promise<void> {
        try {

            const userExistsQuery = `SELECT COUNT(*) FROM UTENTI WHERE CODUTE = ?`;
            let result = await Orm.query(this.accessiOptions.databaseOptions, userExistsQuery, [codiceUtente]);

            if (result[0].COUNT === 0) {
                throw new Error(`L'utente con codice ${codiceUtente} non esiste.`);
            }

            const deleteQuery = `DELETE FROM UTENTI_RUOLI WHERE CODUTE = ?`;
            await Orm.query(this.accessiOptions.databaseOptions, deleteQuery, [codiceUtente]);

            const insertQuery = `INSERT INTO UTENTI_RUOLI (CODUTE, CODRUO) VALUES (?, ?)`;

            for (const codiceRuolo of roles) {
                await Orm.query(this.accessiOptions.databaseOptions, insertQuery, [codiceUtente, codiceRuolo]);
            }
        } catch (error) {
            throw error;
        }
    }


    public async assignPermissionsToUser(codiceUtente: number, permissions: Permission[]): Promise<void> {
        try {

            const userExistsQuery = `SELECT COUNT(*) FROM UTENTI WHERE CODUTE = ?`;
            let result = await Orm.query(this.accessiOptions.databaseOptions, userExistsQuery, [codiceUtente]);

            if (result[0].COUNT === 0) {
                throw new Error(`L'utente con codice ${codiceUtente} non esiste.`);
            }

            const deleteQuery = `DELETE FROM ABILITAZIONI WHERE CODUTE = ?`;
            await Orm.execute(this.accessiOptions.databaseOptions, deleteQuery, [codiceUtente]);

            const insertQuery = `INSERT INTO ABILITAZIONI (CODUTE, CODMNU, TIPABI) VALUES (?, ?, ?)`;

            for (const permission of permissions) {
                await Orm.execute(this.accessiOptions.databaseOptions, insertQuery, [codiceUtente, permission.codiceMenu, permission.tipoAbilitazione]);
            }
        } catch (error) {
            throw error;
        }
    }


    public async deleteRole(codiceRuolo: number): Promise<void> {
        try {

            const existsQuery = `SELECT COUNT(*) FROM RUOLI WHERE CODRUO = ?`;
            let result = await Orm.query(this.accessiOptions.databaseOptions, existsQuery, [codiceRuolo]);

            if (result[0].COUNT === 0) {
                throw new Error(`Il ruolo con codice ${codiceRuolo} non esiste.`);
            }

            const deleteRoleMenusQuery = `DELETE FROM RUOLI_MNU WHERE CODRUO = ?`;
            await Orm.query(this.accessiOptions.databaseOptions, deleteRoleMenusQuery, [codiceRuolo]);

            const deleteRoleUsersQuery = `DELETE FROM UTENTI_RUOLI WHERE CODRUO = ?`;
            await Orm.query(this.accessiOptions.databaseOptions, deleteRoleUsersQuery, [codiceRuolo]);

            const deleteRoleQuery = `DELETE FROM RUOLI WHERE CODRUO = ?`;
            await Orm.query(this.accessiOptions.databaseOptions, deleteRoleQuery, [codiceRuolo]);

        } catch (error) {
            throw error;
        }
    }


    public async getMenus(): Promise<MenuEntity[]> {
        try {
            const query = `
                SELECT 
                    M.CODMNU AS codiceMenu, 
                    M.DESMNU AS descrizioneMenu,
                    M.CODGRP AS codiceGruppo,
                    G.DESGRP AS descrizioneGruppo,
                    M.ICON AS icona,
                    M.CODTIP AS tipo,
                    M.PAGINA AS pagina
                FROM MENU M
                LEFT JOIN MENU_GRP G ON M.CODGRP = G.CODGRP
                WHERE M.FLGENABLED = 1
                ORDER BY G.CODGRP, M.CODMNU
            `;

            const result = await Orm.query(this.accessiOptions.databaseOptions, query, []);
            return result.map(RestUtilities.convertKeysToCamelCase);
        } catch (error) {
            throw error;
        }
    }


    public async getUserRolesAndGrants(codiceUtente: number): Promise<{
        abilitazioni: AbilitazioneMenu[],
        ruoli: Role[],
        grants: AbilitazioneMenu[]
    }> {
        try {
            const codiceUtenteQuery = "SELECT FLGSUPER as flag_super FROM UTENTI_CONFIG WHERE CODUTE = ?";
            let result = await Orm.query(this.accessiOptions.databaseOptions, codiceUtenteQuery, [codiceUtente]);
            if (!result || result.length == 0) throw new Error("Nessun utente trovato con il codice utente " + codiceUtente);
    
            result = result.map(RestUtilities.convertKeysToCamelCase) as { flagSuper: boolean }[];
            const isSuperAdmin = result[0].flagSuper;
    
            let abilitazioni: AbilitazioneMenu[] = [];
            let ruoli: Role[] = [];
    
            if (isSuperAdmin) {
                const query = `
                    SELECT
                        M.CODMNU AS codice_menu,
                        30 AS tipo_abilitazione,
                        M.DESMNU AS descrizione_menu,
                        G.DESGRP AS descrizione_gruppo,
                        G.CODGRP AS codice_gruppo,
                        M.ICON AS icona,
                        M.CODTIP AS tipo,
                        M.PAGINA AS pagina
                    FROM MENU M
                    INNER JOIN MENU_GRP G ON G.CODGRP = M.CODGRP
                    WHERE M.FLGENABLED = 1 AND G.FLGENABLED = 1
                `;
                abilitazioni = await Orm.query(this.accessiOptions.databaseOptions, query, [])
                    .then(results => results.map(RestUtilities.convertKeysToCamelCase)) as AbilitazioneMenu[];
            } else {
                const queryAbilitazioni = `
                    SELECT
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
                    WHERE A.CODUTE = ? AND M.FLGENABLED = 1 AND G.FLGENABLED = 1
                `;
                abilitazioni = await Orm.query(this.accessiOptions.databaseOptions, queryAbilitazioni, [codiceUtente])
                    .then(results => results.map(RestUtilities.convertKeysToCamelCase)) as AbilitazioneMenu[];
    
                const queryRuoli = `
                    SELECT
                        R.CODRUO AS codice_ruolo,
                        R.DESRUO AS descrizione_ruolo,
                        RM.CODMNU AS codice_menu,
                        RM.TIPABI AS tipo_abilitazione,
                        M.DESMNU AS descrizione_menu
                    FROM RUOLI_UTENTI RU
                    INNER JOIN RUOLI R ON RU.CODRUL = R.CODRUL
                    INNER JOIN RUOLI_MENU RM ON R.CODRUL = RM.CODRUL
                    INNER JOIN MENU M ON RM.CODMNU = M.CODMNU
                    INNER JOIN MENU_GRP G ON G.CODGRP = M.CODGRP
                    WHERE RU.CODUTE = ? AND M.FLGENABLED = 1 AND G.FLGENABLED = 1
                `;
                const ruoliResult = await Orm.query(this.accessiOptions.databaseOptions, queryRuoli, [codiceUtente]);
    
                const ruoliMap = new Map<number, Role>();
                for (const row of ruoliResult) {
                    const { codiceRuolo, descrizioneRuolo, codiceMenu, descrizioneMenu, tipoAbilitazione } = row;
    
                    if (!ruoliMap.has(codiceRuolo)) {
                        ruoliMap.set(codiceRuolo, {
                            codiceRuolo,
                            descrizioneRuolo: descrizioneRuolo?.trim(),
                            menu: []
                        });
                    }
    
                    if (codiceMenu) {
                        ruoliMap.get(codiceRuolo)!.menu.push({
                            codiceMenu: codiceMenu.trim(),
                            tipoAbilitazione,
                            descrizioneMenu: descrizioneMenu?.trim(),
                        });
                    }
                }
    
                ruoli = Array.from(ruoliMap.values());
            }
    
            // Merge user-specific and role-based permissions
            const grantsMap = new Map<string, AbilitazioneMenu>();
    
            // Add user-specific permissions
            for (const abilitazione of abilitazioni) {
                grantsMap.set(abilitazione.codiceMenu, abilitazione);
            }
    
            // Add role-based permissions if not already present
            for (const ruolo of ruoli) {
                for (const menu of ruolo.menu) {
                    if (!grantsMap.has(menu.codiceMenu)) {
                        grantsMap.set(menu.codiceMenu, menu);
                    }
                }
            }
    
            const grants = Array.from(grantsMap.values());
    
            return { abilitazioni, ruoli, grants };
        } catch (error) {
            throw error;
        }
    }
    


}
