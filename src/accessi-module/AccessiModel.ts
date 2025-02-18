import { autobind } from "../autobind";
import { Orm } from "../Orm";
import { RestUtilities } from "../Utilities";
import { AccessiOptions } from "./AccessiModule";
import { StatoRegistrazione } from "./models/StatoRegistrazione";



@autobind
export class AccessiModel {
    constructor(private accessiOptions: AccessiOptions) { }

    /**
     * Restituisce la chiave di crittografia utilizzata dal sistema.
     *
     * @returns {string} La chiave di crittografia.
     * @author mttdev382

     */
    public getOptions(): AccessiOptions {
        return this.accessiOptions;
    }

    /**
     * 

    public async addFiltri(params) {
    try {
        let iCodUte = params.codUte;
        let iFiltro = params.filtro;
        let sCodCli = params.codCli;
        let iNumRep = params.numRep;
        let iSuper = params.codSuper;
        let iAgente = params.agente;

        var sSql = "";
        switch (iFiltro) {
            case this.ID_TUTTICLIENTI: {
                //uno o più clienti selezionati
                sSql = "INSERT INTO FILTRI (CODUTE,TIPFIL) VALUES (";
                sSql += iCodUte + "," + this.ID_TUTTICLIENTI.toString() + ")";
                break;
            }
            case this.ID_SELCLIENTE: {
                //uno o più clienti selezionati
                sSql = "INSERT INTO FILTRI (CODUTE,CODCLIENTI,NUMREP,TIPFIL) VALUES (";
                sSql += iCodUte + ",'" + sCodCli + "'," + iNumRep + "," + iFiltro + ")";
                break;
            }
            case this.ID_SELSUPER: {
                //cliente padre
                sSql = "INSERT INTO FILTRI (CODUTE,CODCLISUPER,TIPFIL) VALUES (";
                sSql += iCodUte + "," + iSuper + "," + iFiltro + ")";
                break;
            }
            case this.ID_SELAGENTE: {
                //agente
                sSql = "INSERT INTO FILTRI (CODUTE,CODAGE,TIPFIL) VALUES (";
                sSql += iCodUte + "," + iAgente + "," + iFiltro + ")";
                break;
            }
            default: {
                //è un admin super utente
                sSql = "INSERT INTO FILTRI (CODUTE,TIPFIL) VALUES (";
                sSql += iCodUte + ",99)";
                break;
            }
        }
        let result = await Orm.execute(optionsAccessi, sSql);
        return result;
    } catch (error) {
        throw error;
    }
}
         */


}