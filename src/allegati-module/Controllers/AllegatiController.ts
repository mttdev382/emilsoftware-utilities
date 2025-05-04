import {ApiBody, ApiConsumes, ApiResponse} from "@nestjs/swagger";

import { Controller, Post, Get, Delete, Param, UploadedFiles, UseInterceptors, BadRequestException, Body, Response } from "@nestjs/common";
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
    @UseInterceptors(FilesInterceptor('files'))
    @ApiConsumes('multipart/form-data')
    @ApiResponse({ status: 201, description: 'File caricati con successo.', type: [UploadAllegatoResponseDto] })
    @ApiBody({
        description: 'File da caricare',
        required: true,
        schema: {
            type: 'object',
            properties: {
                files: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary',
                    },
                },
            },
        },
    })

    @Post('upload-single')
    @UseInterceptors(FilesInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiResponse({
      status: 201,
      description: 'File caricato con successo.',
      type: UploadAllegatoResponseDto,
    })
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
          codice: { type: 'string', example: 'RSSMRA85M01H501Z' },
          tipoCodice: { type: 'string', example: 'CF' },
          ordine: { type: 'string', example: '1' },
          descrizioneAllegato: { type: 'string', example: 'Documento di identità' },
          nomeFile: { type: 'string', example: 'documento.pdf' },
          dataInizioValidita: { type: 'string', format: 'date', example: '2024-01-01' },
          dataFineValidita: { type: 'string', format: 'date', example: '2025-01-01' },
          idTipoAllegato: { type: 'integer', example: 3 },
          riferimentoDocumento: { type: 'string', example: 'PRAT-2024-0001' },
        },
      },
    })
    async uploadSingle(
      @UploadedFiles() files: Express.Multer.File[],
      @Body() uploadSingleFileRequest: UploadSingleFileRequest,
    ): Promise<UploadAllegatoResponseDto> {
      if (!files || files.length === 0) {
        throw new BadRequestException('Nessun file fornito');
      }
    
      if (files.length > 1) {
        throw new BadRequestException('Questo endpoint accetta un solo file alla volta');
      }
    
      return await this.allegatiService.uploadFile(files[0], uploadSingleFileRequest);
    }

    @Get(':id')
    @ApiResponse({ status: 200, description: 'File scaricato con successo.', type: DownloadAllegatoResponseDto })
    async download(@Param('id') id: number): Promise<DownloadAllegatoResponseDto> {
        return await this.allegatiService.downloadFile(id);
    }

    @Delete(':id')
    @ApiResponse({ status: 200, description: 'File eliminato con successo.' })
    async delete(@Param('id') id: number, @Response() res: e.Response) {
        await this.allegatiService.deleteFile(id);
        return RestUtilities.sendOKMessage(res, "File eliminato con successo");
    }

    @Get()
    @ApiResponse({ status: 200, description: 'Lista degli allegati.', type: [GetListResponse] })
    async list(@Response() res: e.Response) {
        let data = await this.allegatiService.listFiles();
        return RestUtilities.sendBaseResponse(res, data);
    }
}