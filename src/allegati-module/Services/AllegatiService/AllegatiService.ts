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
            if (error instanceof InternalServerErrorException) {
                throw error;
            }
            throw new InternalServerErrorException('Errore durante il recupero dei tipi di allegato');
        }
    }
    async uploadFile(file: Express.Multer.File, uploadSingleFileRequest: UploadSingleFileRequest): Promise<UploadAllegatoResponseDto> {
        try {
            this.validateFile(file);

            const query = `
                INSERT INTO ALLEGATI (
                  CODICE, TIPCOD, ORDINE, DESALL, NOMEFILE,
                  DADATAVAL, ADATAVAL, ALLEGATO, IDXTIPOALL, DATMODIF, DOCRIF
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
                RETURNING IDXALL
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

            const result = await Orm.query(this.allegatiOptions.databaseOptions, query, params);
            
            if (!result || !result.IDXALL) {
                throw new InternalServerErrorException('Errore durante il salvataggio del file');
            }

            return {
                id: result.IDXALL,
                filename: file.originalname,
            };
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
        try {
            if (!id || id <= 0) {
                throw new BadRequestException('ID allegato non valido');
            }

            const query = `SELECT ALLEGATO as content, NOMEFILE as filename FROM ALLEGATI WHERE IDXALL = ?`;
            const results = await Orm.query(this.allegatiOptions.databaseOptions, query, [id]);
            
            if (!results || results.length === 0) {
                throw new NotFoundException(`Allegato con ID ${id} non trovato`);
            }

            const result = results[0];
            if (!result.CONTENT || !result.FILENAME) {
                throw new InternalServerErrorException('Dati allegato non validi');
            }

            return {
                contentBase64: result.CONTENT.toString('base64'),
                filename: result.FILENAME,
                mimetype: this.detectMimeType(result.FILENAME)
            };
        } catch (error) {
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

            // Verifica esistenza file prima della cancellazione
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
            if (error instanceof BadRequestException || 
                error instanceof NotFoundException || 
                error instanceof InternalServerErrorException) {
                throw error;
            }
            throw new InternalServerErrorException('Errore durante la cancellazione del file');
        }
    }

    async listFiles(): Promise<AllegatoDto[]> {
        try {
            const query = `
                SELECT IDXALL as id, NOMEFILE as filename, 'application/octet-stream' as mimetype, DATMODIF as uploadDate
                FROM ALLEGATI
            `;
            const results = await Orm.query(this.allegatiOptions.databaseOptions, query, []);
            
            if (!results) {
                throw new InternalServerErrorException('Errore durante il recupero della lista dei file');
            }

            return results.map((r: any) => ({
                id: r.ID,
                filename: r.FILENAME,
                mimetype: this.detectMimeType(r.FILENAME),
                uploadDate: r.UPLOADDATE
            }));
        } catch (error) {
            if (error instanceof InternalServerErrorException) {
                throw error;
            }
            throw new InternalServerErrorException('Errore durante il recupero della lista dei file');
        }
    }

}