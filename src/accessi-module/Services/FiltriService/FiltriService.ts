import { Inject, Injectable } from '@nestjs/common';
import { AccessiOptions } from '../../AccessiModule';
import { TipoFiltro } from '../../Dtos/TipoFiltro';
import { Orm } from '../../../Orm';
import { RestUtilities } from '../../../Utilities';
import { Logger } from '../../../Logger';
import { FiltriUtente } from '../../Dtos';

@Injectable()
export class FiltriService {
  private readonly logger = new Logger(FiltriService.name);
  constructor(@Inject('ACCESSI_OPTIONS') private readonly accessiOptions: AccessiOptions) {}

  public async getTipoFiltri(): Promise<TipoFiltro[]> {
    try {
      let getQuery =
        'SELECT TIPFIL AS TIP_FIL, DESFIL AS DES_FIL, FLDFIL AS FLD_FIL, FLGENABLED AS FLG_ENABLED FROM FILTRI_TIPO';
      const params = [];

      let result = await Orm.query(this.accessiOptions.databaseOptions, getQuery, params);
      return result.map(RestUtilities.convertKeysToCamelCase);
    } catch (error) {
      this.logger.error('Errore durante il recupero dei tipi di filtri', error);
      throw error;
    }
  }

  public async getFiltriUtente(codUte: number): Promise<FiltriUtente[]> {
    try {



      let params = []

      let getQuery = `SELECT CODUTE AS COD_UTE, PROG AS PROGRESSIVO, NUMREP AS NUM_REP, IDXPERS AS IDX_PERS, CODCLISUPER AS COD_CLI_SUPER, CODAGE AS COD_AGE, CODCLICOL AS COD_CLI_COL,
        CODCLIENTI AS COD_CLIENTI, TIPFIL AS TIP_FIL, CODDIP AS COD_DIP, IDXPOS AS IDX_POS FROM FILTRI `;
      
      if (codUte === undefined) {
        this.logger.log('Nessun utente passato, recupero i filtri di tutti gli utenti...')
      } else {
        this.logger.log('codUte passato, recupero i filtri dell utente ' + codUte)
        getQuery += ' WHERE CODUTE = ?'
        params.push(codUte)
      }

      let result = await Orm.query(this.accessiOptions.databaseOptions, getQuery, params)
      return result.map(RestUtilities.convertKeysToCamelCase)
    } catch (error) {
      throw error
    }
  }
}
