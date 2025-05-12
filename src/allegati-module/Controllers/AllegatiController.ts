import {ApiBody, ApiConsumes, ApiResponse, ApiQuery} from "@nestjs/swagger";

import { Controller, Post, Get, Delete, Param, UploadedFiles, UseInterceptors, BadRequestException, Body, Response, Query, Res } from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { AllegatiService } from "../Services/AllegatiService/AllegatiService";
import {UploadAllegatoResponseDto} from "../Dtos/responses/UploadAllegatoResponseDto";
import {AllegatoDto} from "../Dtos/AllegatoDto";
import {DownloadAllegatoResponseDto} from "../Dtos/responses/DownloadAllegatoResponseDto";
import { UploadSingleFileRequest } from "../Dtos/UploadSingleFileRequest";
import { RestUtilities } from "../../Utilities";
import e from "express";
import { GetListResponse } from "../Dtos/responses/GetListResponse";

@Controller('allegati')
export class AllegatiController {

    constructor(private readonly allegatiService: AllegatiService) {}

    @Post('upload')
    @UseInterceptors(FilesInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiResponse({ status: 201, description: 'File caricato con successo.', type: UploadAllegatoResponseDto })
    @ApiBody({
        description: 'File e metadati per l\'upload di un allegato',
        required: true,
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
                codice: { type: 'integer', example: 1 },
                tipoCodice: { type: 'string', example: 'CF' },
                ordine: { type: 'string', example: '1' },
                descrizioneAllegato: { type: 'string', example: 'Documento di identità' },
                dataInizioValidita: { type: 'string', format: 'date', example: '2024-01-01' },
                dataFineValidita: { type: 'string', format: 'date', example: '2025-01-01' },
                idTipoAllegato: { type: 'integer', example: 3 },
                riferimentoDocumento: { type: 'string', example: 'PRAT-2024-0001' }
            },
        },
    })
    async upload(
        @UploadedFiles() files: Express.Multer.File[],
        @Body() uploadRequest: UploadSingleFileRequest
    ): Promise<UploadAllegatoResponseDto> {
        if (!files || files.length === 0) {
            throw new BadRequestException('Nessun file fornito');
        }
        if (files.length > 1) {
            throw new BadRequestException('Questo endpoint accetta un solo file alla volta');
        }
        return await this.allegatiService.uploadFile(files[0], uploadRequest);
    }

    @Get(':id')
    @ApiResponse({ status: 200, description: 'File scaricato con successo.', type: DownloadAllegatoResponseDto })
    async download(@Param('id') id: number): Promise<DownloadAllegatoResponseDto> {
        return await this.allegatiService.downloadFile(id);
    }

    @Get(':id/download')
    @ApiResponse({ status: 200, description: 'File scaricato con successo.' })
    async downloadFile(
        @Param('id') id: number,
        @Res() res: e.Response
    ): Promise<void> {
        const file = await this.allegatiService.downloadFile(id);
        
        // Set headers for file download
        res.setHeader('Content-Type', file.mimetype);
        res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
        
        // Convert base64 to buffer and send
        const buffer = Buffer.from(file.contentBase64, 'base64');
        res.send(buffer);
    }

    @Delete(':id')
    @ApiResponse({ status: 200, description: 'File eliminato con successo.' })
    async delete(@Param('id') id: number, @Response() res: e.Response) {
        await this.allegatiService.deleteFile(id);
        return RestUtilities.sendOKMessage(res, "File eliminato con successo");
    }

    @Get()
    @ApiResponse({ status: 200, description: 'Lista degli allegati.', type: [AllegatoDto] })
    @ApiQuery({ name: 'tipcod', required: false, description: 'Filtra per tipo codice' })
    @ApiQuery({ name: 'codice', required: false, description: 'Filtra per codice' })
    @ApiQuery({ name: 'docrif', required: false, description: 'Filtra per riferimento documento' })
    @ApiQuery({ name: 'idxtipoall', required: false, description: 'Filtra per tipo allegato', type: Number })
    async list(
        @Query('tipcod') tipcod?: string,
        @Query('codice') codice?: number,
        @Query('docrif') docrif?: string,
        @Query('idxtipoall') idxtipoall?: number
    ): Promise<AllegatoDto[]> {
        return await this.allegatiService.listFiles({
            tipcod,
            codice,
            docrif,
            idxtipoall: idxtipoall ? Number(idxtipoall) : undefined
        });
    }
}