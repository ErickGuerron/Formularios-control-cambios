import { RfcService } from './../rfc/rfc.service';
import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath
} from '@nestjs/swagger';
import { CreateRfcDto } from './dto/create-rfc.dto';
import { AssigneeDto } from './dto/assignee.dto';

@ApiTags('RFC')
@ApiBearerAuth()
@ApiExtraModels(AssigneeDto)
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

  @Get('assignees')
  @ApiOperation({
    summary: 'Listar usuarios asignables del repositorio',
    description:
      'Retorna la lista de usuarios que pueden ser asignados como responsables (assignees) en issues del repositorio configurado.'
  })
  @ApiOkResponse({
    description: 'Lista de usuarios asignables recuperada correctamente.',
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(AssigneeDto) },
      example: [
        {
          login: 'ErickGuerron',
          name: 'Erick Guerrón',
          avatarUrl: 'https://avatars.githubusercontent.com/u/1234567?v=4'
        },
        {
          login: 'colaborador2',
          name: null,
          avatarUrl: 'https://avatars.githubusercontent.com/u/7654321?v=4'
        }
      ]
    }
  })
  @ApiUnauthorizedResponse({
    description: 'No autorizado. Token inválido o ausente.'
  })
  @ApiForbiddenResponse({
    description: 'Prohibido. El token no tiene permisos sobre el repositorio.'
  })
  @ApiInternalServerErrorResponse({
    description: 'Error interno al consultar los usuarios asignables.'
  })
  getAssignees() {
    return this.svc.listAssignableUsers();
  }
}
