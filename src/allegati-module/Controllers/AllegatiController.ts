import {ApiBody, ApiConsumes, ApiResponse} from "@nestjs/swagger";
import { Controller, Post, Get, Delete, Param, UploadedFiles, UseInterceptors, BadRequestException } from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { AllegatiService } from "../Services/AllegatiService/AllegatiService";
import {UploadAllegatoResponseDto} from "../Dtos/UploadAllegatoResponseDto";
import {AllegatoDto} from "../Dtos/AllegatoDto";
import {DownloadAllegatoResponseDto} from "../Dtos/DownloadAllegatoResponseDto";

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
    async upload(@UploadedFiles() files: Express.Multer.File[]): Promise<UploadAllegatoResponseDto[]> {
        return await this.allegatiService.uploadFiles(files);
    }

    @Post('upload-single')
    @UseInterceptors(FilesInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiResponse({ status: 201, description: 'File caricato con successo.', type: UploadAllegatoResponseDto })
    @ApiBody({
        description: 'File da caricare',
        required: true,
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    async uploadSingle(@UploadedFiles() files: Express.Multer.File[]): Promise<UploadAllegatoResponseDto> {
        if (!files || files.length === 0) {
            throw new BadRequestException('Nessun file fornito');
        }
        if (files.length > 1) {
            throw new BadRequestException('Questo endpoint accetta un solo file alla volta');
        }
        return await this.allegatiService.uploadFile(files[0]);
    }

    @Get(':id')
    @ApiResponse({ status: 200, description: 'File scaricato con successo.', type: DownloadAllegatoResponseDto })
    async download(@Param('id') id: number): Promise<DownloadAllegatoResponseDto> {
        return await this.allegatiService.downloadFile(id);
    }

    @Delete(':id')
    @ApiResponse({ status: 200, description: 'File eliminato con successo.' })
    async delete(@Param('id') id: number) {
        await this.allegatiService.deleteFile(id);
        return { success: true };
    }

    @Get()
    @ApiResponse({ status: 200, description: 'Lista degli allegati.', type: [AllegatoDto] })
    async list(): Promise<AllegatoDto[]> {
        return await this.allegatiService.listFiles();
    }
}