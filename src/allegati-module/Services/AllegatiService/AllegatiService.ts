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
        try {
            const query = `SELECT IDXTIPOALL as id, DESCRIZIONE as description FROM TIPOALL`;
            const results = await Orm.query(this.allegatiOptions.databaseOptions, query);
            
            if (!results) {
                throw new InternalServerErrorException('Errore durante il recupero dei tipi di allegato');
            }

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

            // Convert buffer to base64 in chunks to avoid memory issues
            const chunkSize = 1024 * 1024; // 1MB chunks
            let base64Content = '';
            for (let i = 0; i < file.buffer.length; i += chunkSize) {
                const chunk = file.buffer.slice(i, i + chunkSize);
                base64Content += chunk.toString('base64');
            }

            const insertQuery = `
                INSERT INTO ALLEGATI (
                    CODICE, TIPCOD, ORDINE, DESALL, NOMEFILE,
                    DADATAVAL, ADATAVAL, ALLEGATO, IDXTIPOALL, DATMODIF, DOCRIF
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
                RETURNING IDXALL
            `;

            const params = [
                uploadSingleFileRequest.codice,
                uploadSingleFileRequest.tipoCodice,
                uploadSingleFileRequest.ordine,
                uploadSingleFileRequest.descrizioneAllegato,
                file.originalname,
                uploadSingleFileRequest.dataInizioValidita,
                uploadSingleFileRequest.dataFineValidita,
                base64Content,
                uploadSingleFileRequest.idTipoAllegato,
                uploadSingleFileRequest.riferimentoDocumento
            ];

            const result = await Orm.query(this.allegatiOptions.databaseOptions, insertQuery, params);
            
            if (!result || !result[0] || !result[0].IDXALL) {
                throw new InternalServerErrorException('Errore durante il salvataggio del file');
            }

            return {
                id: result[0].IDXALL,
                filename: file.originalname,
            };
        } catch (error) {
            console.error('[AllegatiService] uploadFile - Errore:', error);
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
        try {
            if (!id || id <= 0) {
                throw new BadRequestException('ID allegato non valido');
            }

            const query = `
                SELECT 
                    ALLEGATO as content,
                    NOMEFILE as filename,
                    IDXTIPOALL as idTipoAllegato
                FROM ALLEGATI 
                WHERE IDXALL = ?
            `;
            
            const results = await Orm.query(this.allegatiOptions.databaseOptions, query, [id]);
            
            if (!results || results.length === 0) {
                throw new NotFoundException(`Allegato con ID ${id} non trovato`);
            }

            const result = results[0];
            if (!result.CONTENT) {
                throw new InternalServerErrorException('Contenuto file non disponibile');
            }

            if (!result.FILENAME) {
                throw new InternalServerErrorException('Nome file non disponibile');
            }

            const mimetype = this.detectMimeType(result.FILENAME);
            
            return {
                contentBase64: result.CONTENT,
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
        try {
            if (!id || id <= 0) {
                throw new BadRequestException('ID allegato non valido');
            }

            const checkQuery = `SELECT IDXALL FROM ALLEGATI WHERE IDXALL = ?`;
            const checkResult = await Orm.query(this.allegatiOptions.databaseOptions, checkQuery, [id]);
            
            if (!checkResult || checkResult.length === 0) {
                throw new NotFoundException(`Allegato con ID ${id} non trovato`);
            }

            const query = `DELETE FROM ALLEGATI WHERE IDXALL = ?`;
            const result = await Orm.execute(this.allegatiOptions.databaseOptions, query, [id]);
            
            if (!result) {
                throw new InternalServerErrorException('Errore durante la cancellazione del file');
            }
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

            const results = await Orm.query(this.allegatiOptions.databaseOptions, query, params);
            
            if (!results) {
                throw new InternalServerErrorException('Errore durante il recupero della lista dei file');
            }

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

    /**
     * Find allegati by any combination of tipcod, codice, docrif, idxtipoall
     */
    async findByFields(fields: { tipcod?: string; codice?: number; docrif?: string; idxtipoall?: number }): Promise<AllegatoDto[]> {
        try {
            const whereConditions: string[] = [];
            const params: any[] = [];
            if (fields.tipcod) {
                whereConditions.push('TIPCOD = ?');
                params.push(fields.tipcod);
            }
            if (fields.codice) {
                whereConditions.push('CODICE = ?');
                params.push(fields.codice);
            }
            if (fields.docrif) {
                whereConditions.push('DOCRIF = ?');
                params.push(fields.docrif);
            }
            if (fields.idxtipoall !== undefined) {
                whereConditions.push('IDXTIPOALL = ?');
                params.push(fields.idxtipoall);
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
            const results = await Orm.query(this.allegatiOptions.databaseOptions, query, params);
            if (!results) {
                throw new InternalServerErrorException('Errore durante la ricerca degli allegati');
            }
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
            console.error('[AllegatiService] findByFields - Errore:', error);
            throw new InternalServerErrorException('Errore durante la ricerca degli allegati');
        }
    }

    /**
     * Update tipcod, codice, docrif, idxtipoall for a given allegato by id
     */
    async updateFieldsById(id: number, fields: { tipcod?: string; codice?: number; docrif?: string; idxtipoall?: number }): Promise<void> {
        try {
            if (!id || id <= 0) {
                throw new BadRequestException('ID allegato non valido');
            }
            const updates: string[] = [];
            const params: any[] = [];
            if (fields.tipcod !== undefined) {
                updates.push('TIPCOD = ?');
                params.push(fields.tipcod);
            }
            if (fields.codice !== undefined) {
                updates.push('CODICE = ?');
                params.push(fields.codice);
            }
            if (fields.docrif !== undefined) {
                updates.push('DOCRIF = ?');
                params.push(fields.docrif);
            }
            if (fields.idxtipoall !== undefined) {
                updates.push('IDXTIPOALL = ?');
                params.push(fields.idxtipoall);
            }
            if (updates.length === 0) {
                throw new BadRequestException('Nessun campo da aggiornare');
            }
            const query = `UPDATE ALLEGATI SET ${updates.join(', ')} WHERE IDXALL = ?`;
            params.push(id);
            const result = await Orm.execute(this.allegatiOptions.databaseOptions, query, params);
            if (!result) {
                throw new InternalServerErrorException('Errore durante l\'aggiornamento del file');
            }
        } catch (error) {
            console.error('[AllegatiService] updateFieldsById - Errore:', error);
            throw error;
        }
    }

    /**
     * Get a single allegato by fields (returns the first match)
     */
    async getOneByFields(fields: { tipcod?: string; codice?: number; docrif?: string; idxtipoall?: number }): Promise<AllegatoDto | null> {
        const results = await this.findByFields(fields);
        return results.length > 0 ? results[0] : null;
    }

}