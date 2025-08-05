import { Inject, Injectable } from "@nestjs/common";
import { autobind } from "../../../autobind";
import { Orm } from "../../../Orm";
import { RestUtilities } from "../../../Utilities";
import { AccessiOptions } from "../../AccessiModule";
import { StatoRegistrazione } from "../../Dtos/StatoRegistrazione";
import { EmailService } from "../EmailService/EmailService";
import { FiltriUtente } from "../../Dtos/FiltriUtente";
import { GetUsersResponse, GetUsersResult } from "../../Dtos/GetUsersResponse";
import { PermissionService } from "../PermissionService/PermissionService";
import { UserDto } from "../../Dtos";
import { RegisterRequest } from "../../Dtos/RegisterRequest";

@autobind
@Injectable()
export class UserService {

    constructor(
        @Inject('ACCESSI_OPTIONS') private readonly accessiOptions: AccessiOptions, private readonly emailService: EmailService, private readonly permissionService: PermissionService
    ) { }


    async getUsers(filters?: { email?: string, codiceUtente?: number }, options?: { includeExtensionFields: boolean, includeGrants: boolean }): Promise<GetUsersResult[]> {
        try {
            let query = ` 
            SELECT  
                U.CODUTE as codice_utente, 
                U.USRNAME as email, 
                U.FLGGDPR as flag_gdpr, 
                U.DATGDPR as data_gdpr, 
                U.DATINS as data_inserimento, 
                U.DATSCAPWD as data_scadenza_password, 
                U.DATLASTLOGIN as data_last_login, 
                U.STAREG as stato_registrazione, 
                G.COGNOME as cognome, 
                G.NOME as nome, 
                G.AVATAR as avatar, 
                G.FLG2FATT as flag_due_fattori, 
                G.CODLINGUA as codice_lingua,
                G.CELLULARE as cellulare,
                G.FLGSUPER as flag_super, 
                G.PAGDEF as pagina_default,
                G.JSON_METADATA as json_metadata,
                G.RAGSOCCLI as rag_soc_cli,
                F.NUMREP AS num_rep,
                F.IDXPERS AS idx_pers,
                F.CODCLISUPER AS cod_cli_super,
                F.CODAGE AS cod_age,
                F.CODCLICOL AS cod_cli_col,
                F.CODCLIENTI AS codice_clienti,
                F.TIPFIL AS tip_fil
            FROM UTENTI U 
            INNER JOIN UTENTI_CONFIG G ON U.CODUTE = G.CODUTE
            LEFT JOIN FILTRI F ON F.CODUTE = U.CODUTE
            WHERE 1=1
            `;

            let queryParams: any[] = [];

            if (filters.email) {
                query += ` AND LOWER(U.USRNAME) = ? `;
                queryParams.push(filters.email.trim().toLowerCase());
            }

            if (filters.codiceUtente) {
                query += ` AND U.CODUTE = ? `;
                queryParams.push(filters.codiceUtente);
            }

            query += ` ORDER BY U.CODUTE DESC `;

            let users = await Orm.query(this.accessiOptions.databaseOptions, query, queryParams) as UserDto[];
            users = users.map(RestUtilities.convertKeysToCamelCase);

            let usersResponse: GetUsersResult[] = [];

            console.log("OPTIONS: ", options);
            for (const user of users) {
                let userGrants = null;

                if (options.includeGrants) userGrants = await this.permissionService.getUserRolesAndGrants(user.codiceUtente);

                let extensionFields = options.includeExtensionFields ? {} : null;

                if (options.includeExtensionFields) {
                    for (const ext of this.accessiOptions.extensionFieldsOptions) {
                        const values = (
                            await Orm.query(
                                ext.databaseOptions,
                                `SELECT ${ext.tableFields.join(",")} FROM ${ext.tableName} WHERE ${ext.tableJoinFieldName
                                } = ?`,
                                [user.codiceUtente]
                            )
                        ).map(RestUtilities.convertKeysToCamelCase);

                        extensionFields[ext.objectKey] = values;
                    }
                }

                let userResult: GetUsersResult = {
                    utente: user,
                    userGrants: userGrants,
                    extensionFields: extensionFields
                }

                usersResponse.push(userResult);
            }

            console.log("OPTIONS: ", options);

            return usersResponse;
        } catch (error) {
            throw error;
        }
    }

    async getCodiceUtenteByEmail(email: string): Promise<{ codiceUtente: number }> {
        try {
            const query = `SELECT CODUTE as codice_utente FROM UTENTI WHERE LOWER(USRNAME) = ?`;
            const result = await Orm.query(this.accessiOptions.databaseOptions, query, [email.trim().toLowerCase()]);
            return result.map(RestUtilities.convertKeysToCamelCase)[0];
        } catch (error) {
            throw error;
        }
    }

    async getUserByEmail(email: string): Promise<UserDto | null> {
        const query = `
            SELECT 
                U.CODUTE AS codice_utente, 
                U.USRNAME AS email, 
                U.FLGGDPR AS flag_gdpr,
                U.DATSCAPWD as data_scadenza_password,
                U.STAREG AS stato_registrazione, 
                C.COGNOME AS cognome, 
                C.NOME AS nome, 
                C.AVATAR AS avatar, 
                C.FLG2FATT AS flag_due_fattori,
                C.CODLINGUA AS codice_lingua, 
                C.CELLULARE AS cellulare, 
                C.FLGSUPER AS flag_super, 
                C.PAGDEF AS pagina_default,
                C.RAGSOCCLI AS rag_soc_cli
            FROM UTENTI U
            INNER JOIN UTENTI_CONFIG C ON C.CODUTE = U.CODUTE
            WHERE LOWER(U.USRNAME) = ?
        `;

        const utenti = await Orm.query(this.accessiOptions.databaseOptions, query, [email])
            .then(results => results.map(RestUtilities.convertKeysToCamelCase)) as UserDto[];

        return utenti.length > 0 ? utenti[0] : null;
    }

    async getUserFilters(codiceUtente: number): Promise<FiltriUtente[]> {
        const query = `
            SELECT 
                F.PROG AS progressivo, 
                F.NUMREP AS numero_report, 
                F.IDXPERS AS indice_personale,
                F.CODCLISUPER AS codice_cliente_super, 
                F.CODAGE AS codice_agenzia, 
                F.CODCLICOL AS codice_cliente_collegato,
                F.CODCLIENTI AS codice_clienti, 
                F.TIPFIL AS tipo_filtro
            FROM FILTRI F
            WHERE F.CODUTE = ?
        `;

        return await Orm.query(this.accessiOptions.databaseOptions, query, [codiceUtente])
            .then(results => results.map(RestUtilities.convertKeysToCamelCase)) as FiltriUtente[];
    }

    async insertUserFilters(codiceUtente: number, filterData: RegisterRequest): Promise<void> {
        try {
            if (!codiceUtente || codiceUtente <= 0) {
                throw new Error('Codice utente non valido');
            }

            const fieldMapping: Record<string, { dbField: string; type: 'string' | 'number' }> = {
                numeroReport: { dbField: 'NUMREP', type: 'number' },
                indicePersonale: { dbField: 'IDXPERS', type: 'number' },
                codiceClienteSuper: { dbField: 'CODCLISUPER', type: 'string' },
                codiceAgenzia: { dbField: 'CODAGE', type: 'string' },
                codiceClienteCollegato: { dbField: 'CODCLICOL', type: 'string' },
                codiceClienti: { dbField: 'CODCLIENTI', type: 'string' },
                tipoFiltro: { dbField: 'TIPFIL', type: 'string' }
            };

            const fieldsToInsert = Object.entries(fieldMapping)
                .filter(([tsField]) => {
                    const value = filterData[tsField as keyof RegisterRequest];
                    return value !== undefined && value !== null && value !== '';
                })
                .map(([tsField, config]) => {
                    const value = filterData[tsField as keyof RegisterRequest];

                    if (config.type === 'number' && typeof value !== 'number') {
                        throw new Error(`Il campo ${tsField} deve essere un numero`);
                    }
                    if (config.type === 'string' && typeof value !== 'string') {
                        throw new Error(`Il campo ${tsField} deve essere una stringa`);
                    }

                    return { tsField, dbField: config.dbField, value };
                });

            if (fieldsToInsert.length === 0) {
                return;
            }

            await this.executeInTransaction(async () => {
                await Orm.execute(
                    this.accessiOptions.databaseOptions,
                    'DELETE FROM FILTRI WHERE CODUTE = ?',
                    [codiceUtente]
                );

                const dbFields = ['CODUTE', ...fieldsToInsert.map(f => f.dbField)];
                const placeholders = dbFields.map(() => '?');
                const values = [codiceUtente, ...fieldsToInsert.map(f => f.value)];

                const insertQuery = `INSERT INTO FILTRI (${dbFields.join(', ')}) VALUES (${placeholders.join(', ')})`;
                await Orm.execute(this.accessiOptions.databaseOptions, insertQuery, values);
            });

        } catch (error) {
            throw new Error(`Errore durante l'inserimento dei filtri per utente ${codiceUtente}: ${error.message}`);
        }
    }

    private async executeInTransaction(operation: () => Promise<void>): Promise<void> {
        await operation();
    }



    async register(registrationData: RegisterRequest): Promise<string> {
        try {
            const existingUser = await Orm.query(
                this.accessiOptions.databaseOptions,
                "SELECT CODUTE FROM UTENTI WHERE USRNAME = ?",
                [registrationData.email]
            );

            if (existingUser.length > 0) {
                throw new Error("Questa e-mail è già stata utilizzata!");
            }


            const queryUtenti = `INSERT INTO UTENTI (USRNAME, STAREG) VALUES (?,?) RETURNING CODUTE`;
            const paramsUtenti = [registrationData.email, StatoRegistrazione.INVIO];

            const codiceUtente = (await Orm.query(this.accessiOptions.databaseOptions, queryUtenti, paramsUtenti)).CODUTE;

            const utentiConfigFields = ['CODUTE', 'COGNOME', 'NOME'];
            const utentiConfigPlaceholders = ['?', '?', '?'];
            const utentiConfigParams = [codiceUtente, registrationData.cognome, registrationData.nome];

            // Mapping dei campi opzionali
            const optionalFields: [keyof typeof registrationData, string][] = [
                ['cellulare', 'CELLULARE'],
                ['flagSuper', 'FLGSUPER'],
                ['avatar', 'AVATAR'],
                ['flagDueFattori', 'FLG2FATT'],
                ['paginaDefault', 'PAGDEF'],
                ['ragSocCli', 'RAGSOCCLI'],
            ];

            for (const [key, dbField] of optionalFields) {
                const value = registrationData[key];
                if (value !== undefined && value !== null) {
                    utentiConfigFields.push(dbField);
                    utentiConfigPlaceholders.push('?');
                    utentiConfigParams.push(value);
                }
            }

            const queryUtentiConfig = `INSERT INTO UTENTI_CONFIG (${utentiConfigFields.join(', ')}) VALUES (${utentiConfigPlaceholders.join(', ')})`;
            await Orm.execute(this.accessiOptions.databaseOptions, queryUtentiConfig, utentiConfigParams);

            await this.insertUserFilters(codiceUtente, registrationData);

            if (!!registrationData.roles && registrationData.roles.length > 0) {
                await this.permissionService.assignRolesToUser(codiceUtente, registrationData.roles);
            }

            if (!!registrationData.permissions && registrationData.permissions.length > 0) {
                await this.permissionService.assignPermissionsToUser(codiceUtente, registrationData.permissions);
            }

            return codiceUtente;

        } catch (error) {
            throw error;
        }
    }

    async updateUser(codiceUtente: number, user: UserDto): Promise<void> {
        try {
            if (!codiceUtente) throw new Error("Impossibile aggiornare senza codice utente.");

            // Costruzione dinamica della query per UTENTI
            const utentiUpdates = [];
            const utentiParams = [];

            if (user.email !== undefined) {
                utentiUpdates.push("usrname = ?");
                utentiParams.push(user.email);
            }
            if (user.flagGdpr !== undefined) {
                utentiUpdates.push("flggdpr = ?");
                utentiParams.push(user.flagGdpr);
            }
            if (user.statoRegistrazione !== undefined) {
                utentiUpdates.push("stareg = ?");
                utentiParams.push(user.statoRegistrazione);
            }

            if (utentiUpdates.length > 0) {
                const queryUtenti = `UPDATE UTENTI SET ${utentiUpdates.join(", ")} WHERE CODUTE = ?`;
                utentiParams.push(codiceUtente);
                await Orm.execute(this.accessiOptions.databaseOptions, queryUtenti, utentiParams);
            }

            // Costruzione dinamica della query per UTENTI_CONFIG
            const utentiConfigUpdates = [];
            const utentiConfigParams = [];

            if (user.cognome !== undefined) {
                utentiConfigUpdates.push("cognome = ?");
                utentiConfigParams.push(user.cognome);
            }
            if (user.nome !== undefined) {
                utentiConfigUpdates.push("nome = ?");
                utentiConfigParams.push(user.nome);
            }
            if (user.avatar !== undefined) {
                utentiConfigUpdates.push("avatar = ?");
                utentiConfigParams.push(user.avatar);
            }
            if (user.flagDueFattori !== undefined) {
                utentiConfigUpdates.push("flg2fatt = ?");
                utentiConfigParams.push(user.flagDueFattori);
            }
            if (user.codiceLingua !== undefined) {
                utentiConfigUpdates.push("codlingua = ?");
                utentiConfigParams.push(user.codiceLingua);
            }
            if (user.cellulare !== undefined) {
                utentiConfigUpdates.push("cellulare = ?");
                utentiConfigParams.push(user.cellulare);
            }
            if (user.flagSuper !== undefined) {
                utentiConfigUpdates.push("flgsuper = ?");
                utentiConfigParams.push(user.flagSuper);
            }
            if (user.paginaDefault !== undefined) {
                utentiConfigUpdates.push("pagdef = ?");
                utentiConfigParams.push(user.paginaDefault);
            }
            if (user.jsonMetadata !== undefined) {
                utentiConfigUpdates.push("json_metadata = ?");
                utentiConfigParams.push(user.jsonMetadata);
            }
            if (user.ragSocCli !== undefined) {
                utentiConfigUpdates.push("ragsoccli = ?");
                utentiConfigParams.push(user.ragSocCli);
            }

            if (utentiConfigUpdates.length > 0) {
                const queryUtentiConfig = `UPDATE UTENTI_CONFIG SET ${utentiConfigUpdates.join(", ")} WHERE CODUTE = ?`;
                utentiConfigParams.push(codiceUtente);
                await Orm.execute(this.accessiOptions.databaseOptions, queryUtentiConfig, utentiConfigParams);
            }


            if (!!user.roles && user.roles.length > 0) {
                await this.permissionService.assignRolesToUser(codiceUtente, user.roles);
            }

            if (!!user.permissions && user.permissions.length > 0) {
                await this.permissionService.assignPermissionsToUser(codiceUtente, user.permissions);
            }
        } catch (error) {
            throw error;
        }
    }


    async deleteUser(codiceCliente: number): Promise<void> {
        try {
            const query = `UPDATE UTENTI SET STAREG = ? WHERE CODUTE = ?`;
            await Orm.execute(this.accessiOptions.databaseOptions, query, [StatoRegistrazione.DELETE, codiceCliente]);
        } catch (error) {
            throw error;
        }
    }

    public async setGdpr(codiceUtente: number) {
        try {
            let query = ` UPDATE OR INSERT UTENTI_GDPR SET CODUTE = ?, GDPR = ? `;
            let params = [codiceUtente, true];
            let result = await Orm.execute(this.accessiOptions.databaseOptions, query, params);
            return result;
        } catch (error) {
            throw error;
        }
    }

}

