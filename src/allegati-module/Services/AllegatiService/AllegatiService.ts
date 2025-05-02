import { Inject, Injectable } from "@nestjs/common";
import { autobind } from "../../../autobind";
import { Orm } from "../../../Orm";
import { AllegatiOptions } from "../../AllegatiModule";
import { UploadAllegatoResponseDto, DownloadAllegatoResponseDto, AllegatoDto} from "../../Dtos";

@autobind
@Injectable()
export class AllegatiService {
    constructor(@Inject('ALLEGATI_OPTIONS') private readonly allegatiOptions: AllegatiOptions) {
        this.ensureTableExists().catch(error => {
            console.error('[AllegatiService] Errore creazione tabella ALLEGATI:', error);
        });
    }

    async uploadFile(file: Express.Multer.File): Promise<UploadAllegatoResponseDto> {
        const query = `
            INSERT INTO ALLEGATI (
              CODICE, TIPCOD, ORDINE, DESALL, NOMEFILE,
              DADATAVAL, ADATAVAL, ALLEGATO, IDXTIPOALL, DATMODIF, DOCRIF
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
            RETURNING IDXALL
        `;

        const codice = this.allegatiOptions.codes?.[0]?.id || 'DEFAULT';
        const tipcod = 'DEF'; // can be made configurable
        const ordine = 1;
        const desall = file.originalname;
        const nomefile = file.originalname;
        const dadataval = new Date();
        const adataval = null;
        const allegato = file.buffer;
        const idxtipoall = this.allegatiOptions.attachmentTypes?.[0]?.id || 0;
        const docrif = null;

        const params = [
            codice, tipcod, ordine, desall, nomefile,
            dadataval, adataval, allegato, idxtipoall, docrif
        ];

        const result = await Orm.query(this.allegatiOptions.databaseOptions, query, params);
        return {
            id: result.IDXALL,
            filename: file.originalname,
        };
    }

    async ensureTableExists(): Promise<void> {
        console.warn('[AllegatiService] Skipping ensureTableExists: managed externally.');
    }

    async downloadFile(id: number): Promise<DownloadAllegatoResponseDto> {
        const query = `SELECT ALLEGATO as content, NOMEFILE as filename FROM ALLEGATI WHERE IDXALL = ?`;
        const results = await Orm.query(this.allegatiOptions.databaseOptions, query, [id]);
        const result = results[0];
        return {
            contentBase64: result.CONTENT.toString('base64'),
            filename: result.FILENAME,
            mimetype: 'application/octet-stream'
        };
    }

    async deleteFile(id: number): Promise<void> {
        const query = `DELETE FROM ALLEGATI WHERE IDXALL = ?`;
        await Orm.execute(this.allegatiOptions.databaseOptions, query, [id]);
    }

    async listFiles(): Promise<AllegatoDto[]> {
        const query = `
            SELECT IDXALL as id, NOMEFILE as filename, 'application/octet-stream' as mimetype, DATMODIF as uploadDate
            FROM ALLEGATI
        `;
        const results = await Orm.query(this.allegatiOptions.databaseOptions, query, []);
        return results.map((r: any) => ({
            id: r.ID,
            filename: r.FILENAME,
            mimetype: r.MIMETYPE,
            uploadDate: r.UPLOADDATE
        }));
    }
}