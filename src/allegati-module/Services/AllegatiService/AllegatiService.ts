import { Inject, Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { autobind } from "../../../autobind";
import { Orm } from "../../../Orm";
import { AllegatiOptions } from "../../AllegatiModule";
import { UploadAllegatoResponseDto, DownloadAllegatoResponseDto, AllegatoDto} from "../../Dtos";
import { UploadSingleFileRequest } from "../../Dtos/UploadSingleFileRequest";

export class AllegatiError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly statusCode: number = 500
    ) {
        super(message);
        this.name = 'AllegatiError';
    }
}

@autobind
@Injectable()
export class AllegatiService {
    private readonly MAX_FILE_SIZE = 90 * 1024 * 1024; // 90MB
    private readonly ALLOWED_MIME_TYPES = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    constructor(@Inject('ALLEGATI_OPTIONS') private readonly allegatiOptions: AllegatiOptions) {
        this.ensureTableExists().catch(error => {
            console.error('[AllegatiService] Errore creazione tabella ALLEGATI:', error);
            throw new InternalServerErrorException('Errore durante l\'inizializzazione del servizio allegati');
        });
    }

    private validateFile(file: Express.Multer.File): void {
        if (!file) {
            throw new BadRequestException('Nessun file fornito');
        }

        if (file.size > this.MAX_FILE_SIZE) {
            throw new BadRequestException(`File troppo grande. Dimensione massima consentita: ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`);
        }

        if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            throw new BadRequestException(`Tipo di file non consentito. Tipi consentiti: ${this.ALLOWED_MIME_TYPES.join(', ')}`);
        }
    }


    async getAttachmentTypes(): Promise<any[]> {
        console.log('[AllegatiService] getAttachmentTypes - Inizio operazione');
        const startTime = Date.now();
        try {
            const query = `SELECT IDXTIPOALL as id, DESCRIZIONE as description FROM TIPOALL`;
            console.log('[AllegatiService] getAttachmentTypes - Query:', query);
            
            const results = await Orm.query(this.allegatiOptions.databaseOptions, query);
            const endTime = Date.now();
            
            if (!results) {
                console.error('[AllegatiService] getAttachmentTypes - Nessun risultato trovato');
                throw new InternalServerErrorException('Errore durante il recupero dei tipi di allegato');
            }

            console.log(`[AllegatiService] getAttachmentTypes - Completato in ${endTime - startTime}ms. Trovati ${results.length} tipi`);
            return results;
        } catch (error) {
            console.error('[AllegatiService] getAttachmentTypes - Errore:', error);
            if (error instanceof InternalServerErrorException) {
                throw error;
            }
            throw new InternalServerErrorException('Errore durante il recupero dei tipi di allegato');
        }
    }
    async uploadFile(file: Express.Multer.File, uploadSingleFileRequest: UploadSingleFileRequest): Promise<UploadAllegatoResponseDto> {
        try {
            this.validateFile(file);

            // Test database connection first
            try {
                const testQuery = 'SELECT 1 FROM RDB$DATABASE';
                await Orm.query(this.allegatiOptions.databaseOptions, testQuery);
            } catch (error) {
                throw new InternalServerErrorException('Database connection failed');
            }

            const insertQuery = `
                INSERT INTO ALLEGATI (
                  CODICE, TIPCOD, ORDINE, DESALL, NOMEFILE,
                  DADATAVAL, ADATAVAL, ALLEGATO, IDXTIPOALL, DATMODIF, DOCRIF
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
            `;

            const codice = uploadSingleFileRequest.codice;
            const tipcod = uploadSingleFileRequest.tipoCodice;
            const ordine = uploadSingleFileRequest.ordine;
            const desall = uploadSingleFileRequest.descrizioneAllegato;
            const nomefile = file.originalname;
            const dadataval = uploadSingleFileRequest.dataInizioValidita;
            const adataval = uploadSingleFileRequest.dataFineValidita;
            const allegato = file.buffer;
            const idxtipoall = uploadSingleFileRequest.idTipoAllegato;
            const docrif = uploadSingleFileRequest.riferimentoDocumento;

            const params = [
                codice, tipcod, ordine, desall, nomefile,
                dadataval, adataval, allegato, idxtipoall, docrif
            ];

            try {
                await Orm.execute(this.allegatiOptions.databaseOptions, insertQuery, params);

                const getIdQuery = `
                    SELECT MAX(IDXALL) as IDXALL 
                    FROM ALLEGATI 
                    WHERE CODICE = ? AND TIPCOD = ? AND NOMEFILE = ?
                `;
                
                const result = await Orm.query(this.allegatiOptions.databaseOptions, getIdQuery, [codice, tipcod, nomefile]);
                
                if (!result || !result[0] || !result[0].IDXALL) {
                    throw new InternalServerErrorException('Errore durante il salvataggio del file');
                }

                return {
                    id: result[0].IDXALL,
                    filename: file.originalname,
                };
            } catch (error) {
                throw error;
            }
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
                throw error;
            }
            throw new InternalServerErrorException('Errore durante il caricamento del file');
        }
    }

    async ensureTableExists(): Promise<void> {
        try {
            const query = `
                SELECT RDB$RELATION_NAME 
                FROM RDB$RELATIONS 
                WHERE RDB$RELATION_NAME = 'ALLEGATI'
            `;
            const result = await Orm.query(this.allegatiOptions.databaseOptions, query);
            
            if (!result || result.length === 0) {
                throw new Error('Tabella ALLEGATI non trovata nel database');
            }
        } catch (error) {
            console.error('[AllegatiService] Errore verifica tabella ALLEGATI:', error);
            throw new InternalServerErrorException('Errore durante la verifica della tabella ALLEGATI');
        }
    }

    async downloadFile(id: number): Promise<DownloadAllegatoResponseDto> {
        console.log(`[AllegatiService] downloadFile - Inizio operazione per ID: ${id}`);
        const startTime = Date.now();
        try {
            if (!id || id <= 0) {
                console.error('[AllegatiService] downloadFile - ID non valido:', id);
                throw new BadRequestException('ID allegato non valido');
            }

            // Prima verifichiamo che il file esista
            const checkQuery = `
                SELECT IDXALL, NOMEFILE, IDXTIPOALL 
                FROM ALLEGATI 
                WHERE IDXALL = ?
            `;
            console.log('[AllegatiService] downloadFile - Query verifica:', checkQuery, 'Parametri:', [id]);
            
            const checkResult = await Orm.query(this.allegatiOptions.databaseOptions, checkQuery, [id]);
            
            if (!checkResult || checkResult.length === 0) {
                console.error(`[AllegatiService] downloadFile - Allegato con ID ${id} non trovato`);
                throw new NotFoundException(`Allegato con ID ${id} non trovato`);
            }

            console.log('[AllegatiService] downloadFile - File trovato:', {
                id: checkResult[0].IDXALL,
                filename: checkResult[0].NOMEFILE,
                idTipoAllegato: checkResult[0].IDXTIPOALL
            });

            // Ora recuperiamo il contenuto del file senza CAST
            const query = `
                SELECT 
                    ALLEGATO as content,
                    NOMEFILE as filename,
                    IDXTIPOALL as idTipoAllegato
                FROM ALLEGATI 
                WHERE IDXALL = ?
            `;
            console.log('[AllegatiService] downloadFile - Query recupero contenuto:', query, 'Parametri:', [id]);
            
            const results = await Orm.query(this.allegatiOptions.databaseOptions, query, [id]);
            const endTime = Date.now();
            
            const result = results[0];
            console.log('[AllegatiService] downloadFile - Risultato query:', {
                hasContent: !!result.CONTENT,
                contentType: result.CONTENT ? typeof result.CONTENT : 'null',
                contentLength: result.CONTENT ? result.CONTENT.length : 0,
                filename: result.FILENAME,
                idTipoAllegato: result.IDTIPOALLEGATO
            });

            if (!result.CONTENT) {
                console.error('[AllegatiService] downloadFile - Contenuto file mancante:', {
                    id,
                    filename: result.FILENAME,
                    idTipoAllegato: result.IDTIPOALLEGATO
                });
                throw new InternalServerErrorException('Contenuto file non disponibile');
            }

            if (!result.FILENAME) {
                console.error('[AllegatiService] downloadFile - Nome file mancante:', {
                    id,
                    hasContent: !!result.CONTENT,
                    idTipoAllegato: result.IDTIPOALLEGATO
                });
                throw new InternalServerErrorException('Nome file non disponibile');
            }

            // Converti il contenuto in base64
            let contentBase64: string;
            try {
                console.log(`[AllegatiService] downloadFile - Contenuto BLOB prima della conversione: Lunghezza: ${result.CONTENT.length}`);
                contentBase64 = result.CONTENT.toString('base64');
                console.log(`[AllegatiService] downloadFile - Conversione in base64 completata. Lunghezza: ${contentBase64.length}`);
            } catch (error) {
                console.error('[AllegatiService] downloadFile - Errore conversione in base64:', error);
                throw new InternalServerErrorException('Errore durante la conversione del file');
            }

            // Determina il mimetype
            const mimetype = this.detectMimeType(result.FILENAME);
            console.log(`[AllegatiService] downloadFile - Mimetype rilevato: ${mimetype}`);

            console.log(`[AllegatiService] downloadFile - Completato in ${endTime - startTime}ms. File: ${result.FILENAME}`);
            
            return {
                contentBase64,
                filename: result.FILENAME,
                mimetype
            };
        } catch (error) {
            console.error('[AllegatiService] downloadFile - Errore:', error);
            if (error instanceof BadRequestException || 
                error instanceof NotFoundException || 
                error instanceof InternalServerErrorException) {
                throw error;
            }
            throw new InternalServerErrorException('Errore durante il download del file');
        }
    }

    private detectMimeType(filename: string): string {
        const extension = filename.split('.').pop()?.toLowerCase();
        const mimeTypes: { [key: string]: string } = {
            'pdf': 'application/pdf',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls': 'application/vnd.ms-excel',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        };
        return mimeTypes[extension || ''] || 'application/octet-stream';
    }

    async deleteFile(id: number): Promise<void> {
        console.log(`[AllegatiService] deleteFile - Inizio operazione per ID: ${id}`);
        const startTime = Date.now();
        try {
            if (!id || id <= 0) {
                console.error('[AllegatiService] deleteFile - ID non valido:', id);
                throw new BadRequestException('ID allegato non valido');
            }

            // Verifica esistenza file prima della cancellazione
            const checkQuery = `SELECT IDXALL FROM ALLEGATI WHERE IDXALL = ?`;
            console.log('[AllegatiService] deleteFile - Query verifica:', checkQuery, 'Parametri:', [id]);
            
            const checkResult = await Orm.query(this.allegatiOptions.databaseOptions, checkQuery, [id]);
            
            if (!checkResult || checkResult.length === 0) {
                console.error(`[AllegatiService] deleteFile - Allegato con ID ${id} non trovato`);
                throw new NotFoundException(`Allegato con ID ${id} non trovato`);
            }

            const query = `DELETE FROM ALLEGATI WHERE IDXALL = ?`;
            console.log('[AllegatiService] deleteFile - Query eliminazione:', query, 'Parametri:', [id]);
            
            const result = await Orm.execute(this.allegatiOptions.databaseOptions, query, [id]);
            const endTime = Date.now();
            
            if (!result) {
                console.error('[AllegatiService] deleteFile - Errore durante la cancellazione');
                throw new InternalServerErrorException('Errore durante la cancellazione del file');
            }

            console.log(`[AllegatiService] deleteFile - Completato in ${endTime - startTime}ms`);
        } catch (error) {
            console.error('[AllegatiService] deleteFile - Errore:', error);
            if (error instanceof BadRequestException || 
                error instanceof NotFoundException || 
                error instanceof InternalServerErrorException) {
                throw error;
            }
            throw new InternalServerErrorException('Errore durante la cancellazione del file');
        }
    }

    async listFiles(filters?: { 
        tipcod?: string;
        codice?: number;
        docrif?: string;
        idxtipoall?: number;
    }): Promise<AllegatoDto[]> {
        console.log('[AllegatiService] listFiles - Inizio operazione');
        console.log('[AllegatiService] listFiles - Filtri:', filters);
        const startTime = Date.now();
        try {
            const whereConditions: string[] = [];
            const params: any[] = [];

            if (filters) {
                if (filters.tipcod) {
                    whereConditions.push('TIPCOD = ?');
                    params.push(filters.tipcod);
                }
                if (filters.codice) {
                    whereConditions.push('CODICE = ?');
                    params.push(filters.codice);
                }
                if (filters.docrif) {
                    whereConditions.push('DOCRIF = ?');
                    params.push(filters.docrif);
                }
                if (filters.idxtipoall !== undefined) {
                    whereConditions.push('IDXTIPOALL = ?');
                    params.push(filters.idxtipoall);
                }
            }

            const query = `
                SELECT 
                    IDXALL as id,
                    NOMEFILE as filename,
                    'application/octet-stream' as mimetype,
                    DATMODIF as uploadDate,
                    CODICE as codice,
                    TIPCOD as tipoCodice,
                    ORDINE as ordine,
                    DESALL as descrizioneAllegato,
                    DADATAVAL as dataInizioValidita,
                    ADATAVAL as dataFineValidita,
                    IDXTIPOALL as idTipoAllegato,
                    DOCRIF as riferimentoDocumento
                FROM ALLEGATI
                ${whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''}
            `;

            console.log('[AllegatiService] listFiles - Query:', query);
            console.log('[AllegatiService] listFiles - Parametri:', params);

            const results = await Orm.query(this.allegatiOptions.databaseOptions, query, params);
            const endTime = Date.now();
            
            if (!results) {
                console.error('[AllegatiService] listFiles - Errore durante il recupero della lista');
                throw new InternalServerErrorException('Errore durante il recupero della lista dei file');
            }

            console.log(`[AllegatiService] listFiles - Completato in ${endTime - startTime}ms. Trovati ${results.length} file`);

            return results.map((r: any) => ({
                id: r.ID,
                filename: r.FILENAME,
                mimetype: r.MIMETYPE,
                uploadDate: r.UPLOADDATE,
                codice: r.CODICE,
                tipoCodice: r.TIPOCODICE,
                ordine: r.ORDINE,
                descrizioneAllegato: r.DESCRIZIONEALLEGATO,
                dataInizioValidita: r.DATAINIZIOVALIDITA,
                dataFineValidita: r.DATAFINEVALIDITA,
                idTipoAllegato: r.IDTIPOALLEGATO,
                riferimentoDocumento: r.RIFERIMENTODOCUMENTO
            }));
        } catch (error) {
            console.error('[AllegatiService] listFiles - Errore:', error);
            if (error instanceof InternalServerErrorException) {
                throw error;
            }
            throw new InternalServerErrorException('Errore durante il recupero della lista dei file');
        }
    }

}