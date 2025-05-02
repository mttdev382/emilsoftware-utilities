import {ApiBody, ApiConsumes, ApiResponse} from "@nestjs/swagger";
import { Controller, Post, Get, Delete, Param, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { AllegatiService } from "../Services/AllegatiService/AllegatiService";
import {UploadAllegatoResponseDto} from "../Dtos/UploadAllegatoResponseDto";
import {AllegatoDto} from "../Dtos/AllegatoDto";
import {DownloadAllegatoResponseDto} from "../Dtos/DownloadAllegatoResponseDto";

@Controller('allegati')
export class AllegatiController {

    constructor(private readonly allegatiService: AllegatiService) {}

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data') // 👈 Dichiari che accetti multipart
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

    async upload(@UploadedFile() file: Express.Multer.File): Promise<UploadAllegatoResponseDto> {
        return await this.allegatiService.uploadFile(file);
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