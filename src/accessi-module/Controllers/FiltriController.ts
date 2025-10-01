import { Body, Controller, Get, Inject, Post, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { RestUtilities } from '../../Utilities';
import { AccessiOptions } from '../AccessiModule';
import { BaseResponse, FiltriUtente, GetFiltriUtenteRequest, GetFiltriUtenteResponse } from '../Dtos';
import { GetFiltriRequest, GetFiltriResponse, TipoFiltro } from '../Dtos/TipoFiltro';
import { FiltriService } from '../Services/FiltriService/FiltriService';

@ApiTags('Filtri')
@Controller('accessi/filtri')
export class FiltriController {
  constructor(
    private readonly filtriService: FiltriService,
    @Inject('ACCESSI_OPTIONS') private readonly options: AccessiOptions,
  ) {}

  @Get('tipi')
  @ApiOperation({
    operationId: 'getTipiFiltro',
    summary: 'Recupera la lista dei tipi di filtri',
    description: 'Ritorna tutti i tipi di filtri disponibili nel sistema',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista dei tipi di filtri recuperata con successo',
    type: GetFiltriResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Errore interno durante il recupero dei tipi di filtri',
  })
  async getTipoFiltri(@Res() res: Response) {
    try {
      const response = await this.filtriService.getTipoFiltri();
      return RestUtilities.sendBaseResponse(res, response);
    } catch (error) {
      return RestUtilities.sendErrorMessage(res, error, FiltriController.name);
    }
  }

  @Get('utente')
  @ApiOperation({
    operationId: 'getFiltriUtente',
    summary: 'Recupera i filtri di un utente',
    description: 'Ritorna tutti i filtri associati ad un utente specifico',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista dei filtri dell’utente recuperata con successo',
    type: GetFiltriUtenteResponse,
  })
  async getFiltriUtente(@Res() res: Response, @Query() req: GetFiltriUtenteRequest) {
    try {
      let {codUte} = req
      const response = await this.filtriService.getFiltriUser(codUte);
      return RestUtilities.sendBaseResponse(res, response);
    } catch (error) {
      return RestUtilities.sendErrorMessage(res, error, FiltriController.name);
    }
  }

  @Post('utente')
  @ApiOperation({
    operationId: 'saveFiltriUtente',
    summary: 'Inserisce o aggiorna i filtri di un utente',
    description: 'Permette di salvare (inserire o aggiornare) i filtri associati ad un utente specifico'
  })
  @ApiResponse({
    status: 200,
    description: 'Filtri utente salvati con successo'
  })
  @ApiResponse({
    status: 500,
    description: 'Errore interno durante il salvataggio dei filtri utente',
  })
  async saveFiltriUtente(@Res() res : Response, @Body() req: FiltriUtente) {
    try {
      const response = await this.filtriService.upsertFiltriUtente(req.codUte, req)
      return RestUtilities.sendOKMessage(res,`Aggiornamento filtri per l'utente ${req.codUte} effettuato correttamente`)
    } catch (error) {
      return RestUtilities.sendErrorMessage(res,error,FiltriController.name)
    }
  }
}
