import { RfcService } from './../rfc/rfc.service';
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateRfcDto } from './dto/create-rfc.dto';

@ApiTags('RFC')
@Controller('rfc')
export class RfcController {
  constructor(private readonly svc: RfcService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Crear Issue y mapear campos a Project v2' })
  @ApiBody({ type: CreateRfcDto })
  @ApiResponse({
    status: 201,
    description: 'Issue creada y añadida al Project. Retorna número y URL.'
  })
  @ApiResponse({ status: 500, description: 'Error al crear o mapear.' })
  create(@Body() dto: CreateRfcDto) {
    return this.svc.createRFC(dto);
  }
}
