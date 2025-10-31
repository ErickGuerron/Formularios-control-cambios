import { Controller, Get, Patch, Param, Query, Body } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags, ApiBody } from '@nestjs/swagger';
import { IssuesService } from './issues.service';

@ApiTags('Issues')
@Controller('issues')
export class IssuesController {
  constructor(private readonly svc: IssuesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar issues del repositorio' })
  @ApiQuery({
    name: 'state',
    required: false,
    example: 'all',
    enum: ['open', 'closed', 'all']
  })
  @ApiQuery({
    name: 'state_reason',
    required: false,
    description: 'Filtra por razón de cierre (solo aplica si state=closed)',
    example: 'not_planned',
    enum: ['completed', 'not_planned', 'denied']
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'per_page', required: false, example: 30 })
  async list(
    @Query('state') state: 'open' | 'closed' | 'all' = 'all',
    @Query('state_reason') state_reason: string,
    @Query('page') page = 1,
    @Query('per_page') per_page = 30
  ) {
    return this.svc.listIssues(
      state,
      state_reason,
      Number(page),
      Number(per_page)
    );
  }

  @Patch(':number/state')
  @ApiOperation({ summary: 'Cambiar estado del issue (aprobar/denegar)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['approve', 'denied', 'close_not_planned']
        }
      },
      required: ['action']
    }
  })
  async setState(
    @Param('number') number: string,
    @Body() body: { action: 'approve' | 'denied' | 'close_not_planned' }
  ) {
    return this.svc.setStateNumber(Number(number), body);
  }
}
