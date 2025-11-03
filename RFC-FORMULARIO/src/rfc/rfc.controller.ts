import { RfcService } from './../rfc/rfc.service';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath
} from '@nestjs/swagger';
import { CreateRfcDto } from './dto/create-rfc.dto';
import { AssigneeDto } from './dto/assignee.dto';
import { CreateUserChangeDto } from './dto/create-user-change.dto';
import { UpdateCreateUserChangeDto } from './dto/update-user-change.dto';

@ApiTags('RFC')
@ApiBearerAuth()
@ApiExtraModels(AssigneeDto, CreateUserChangeDto, UpdateCreateUserChangeDto)
@Controller('rfc')
export class RfcController {
  constructor(private readonly svc: RfcService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Crear Issue RFC “clásico” y cerrar como Not Planned'
  })
  @ApiBody({ type: CreateRfcDto })
  @ApiResponse({
    status: 201,
    description: 'Issue creada. Retorna número y URL.',
    schema: {
      example: {
        issueNumber: 123,
        issueUrl: 'https://github.com/owner/repo/issues/123'
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado.' })
  @ApiForbiddenResponse({ description: 'Token sin permisos.' })
  @ApiInternalServerErrorResponse({ description: 'Error al crear la issue.' })
  create(@Body() dto: CreateRfcDto) {
    return this.svc.createRFC(dto);
  }

  @Get('assignees')
  @ApiOperation({
    summary: 'Listar usuarios asignables del repositorio',
    description:
      'Usuarios que pueden ser asignados como responsables en issues.'
  })
  @ApiOkResponse({
    description: 'Lista obtenida.',
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(AssigneeDto) },
      example: [
        {
          login: 'ErickGuerron',
          name: 'Erick Guerrón',
          avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4'
        },
        {
          login: 'colaborador2',
          name: null,
          avatarUrl: 'https://avatars.githubusercontent.com/u/2?v=4'
        }
      ]
    }
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado.' })
  @ApiForbiddenResponse({ description: 'Token sin permisos.' })
  @ApiInternalServerErrorResponse({ description: 'Error interno.' })
  getAssignees() {
    return this.svc.listAssignableUsers();
  }

  @Post('user')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Crear Issue de Solicitud de Cambio (Usuario)',
    description:
      'Crea la issue con label `user`. El mapeo al Project de Usuarios lo realiza tu GitHub Action.'
  })
  @ApiBody({
    type: CreateUserChangeDto,
    examples: {
      sample: {
        summary: 'Ejemplo mínimo',
        value: {
          formName: 'SCR 2025-11',
          title: 'SCR | Ajuste validación teléfono',
          requesterName: 'Juan Pérez',
          department: 'Finanzas',
          email: 'juan.perez@empresa.com',
          requestDate: '2025-11-02',
          changeType: 'Mejora funcional',
          description: 'Validar longitud de teléfono en perfil.',
          reason: 'Evitar datos inválidos y retrabajo.',
          priorityName: 'Media',
          desiredDate: '2025-11-15',
          notes: 'Adjuntar evidencia en PR.'
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Issue creada con label `user`.',
    schema: {
      example: {
        issueNumber: 456,
        issueUrl: 'https://github.com/owner/repo/issues/456'
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado.' })
  @ApiForbiddenResponse({ description: 'Token sin permisos.' })
  @ApiInternalServerErrorResponse({
    description: 'Error al crear la issue de usuario.'
  })
  createUser(@Body() dto: CreateUserChangeDto) {
    return this.svc.createUserRFC(dto);
  }

  @Patch('user/:issueNumber/complete')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Completar/editar Solicitud de Usuario',
    description:
      'Actualiza campos faltantes post-aprobación y permite definir assignees (máx 2) y reviewer. Mantiene la lógica de tu Action para Projects.'
  })
  @ApiParam({
    name: 'issueNumber',
    type: Number,
    description: 'Número de la issue a actualizar'
  })
  @ApiBody({
    type: UpdateCreateUserChangeDto,
    examples: {
      update: {
        summary: 'Ejemplo de actualización',
        value: {
          title: 'SCR | Ajuste validación teléfono (alcance actualizado)',
          impact: 'Afecta flujo de registro y perfil.',
          implementationPlan: '1) Refactor 2) Unit tests 3) Deploy',
          rollbackPlanning: 'Revertir release + desactivar feature flag',
          testPlanning: 'Smoke + e2e en registro/perfil',
          approvers: 'lead@empresa.com, qa@empresa.com',
          startDate: '2025-11-10',
          targetDate: '2025-11-20',
          assignees: ['dev1', 'dev2'],
          reviewer: 'qa-lead',
          email: 'juan.perez@empresa.com'
        }
      }
    }
  })
  @ApiOkResponse({
    description: 'Issue actualizada.',
    schema: { example: { issueNumber: 456, updated: true } }
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado.' })
  @ApiForbiddenResponse({ description: 'Token sin permisos.' })
  @ApiInternalServerErrorResponse({
    description: 'Error al actualizar la issue de usuario.'
  })
  completeUser(
    @Param('issueNumber') issueNumber: number,
    @Body() dto: UpdateCreateUserChangeDto
  ) {
    return this.svc.completeUserRFC(Number(issueNumber), dto);
  }
}
