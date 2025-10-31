/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Octokit } from '@octokit/core';
import { CreateRfcDto } from './dto/create-rfc.dto';

@Injectable()
export class RfcService {
  private readonly repoOwner: string;
  private readonly repoName: string;
  private readonly projectTitle: string;
  private readonly projectId: string;
  private readonly logger = new Logger(RfcService.name);

  public octo!: Octokit;

  constructor(private readonly cfg: ConfigService) {
    this.repoOwner = this.cfg.get<string>('REPO_OWNER')!;
    this.repoName = this.cfg.get<string>('REPO_NAME')!;
    this.projectTitle = this.cfg.get<string>('PROJECT_TITLE') || '';
    this.projectId = this.cfg.get<string>('PROJECT_ID')!;
  }

  private norm(s?: string) {
    return (s ?? '')
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .trim()
      .toLowerCase();
  }

  private issueBody(d: CreateRfcDto) {
    return [
      `### Tipo de cambio`,
      d.tipo || '',
      `### Riesgo`,
      d.riesgo || '',
      `### Impacto`,
      d.impacto || '',
      `### Plan de implementación`,
      d.plan || '',
      `### Plan de reversa (rollback)`,
      d.rollback || '',
      `### Plan de pruebas`,
      d.pruebas || '',
      `### Ventana (inicio)`,
      d.vIni || '',
      `### Ventana (fin)`,
      d.vFin || '',
      `### Aprobadores requeridos`,
      d.aprobadores || '',
      `### Solicitante`,
      d.solicitante || ''
    ].join('\n\n');
  }

  private async createIssue(title: string, body: string, assignees?: string[]) {
    const res = await this.octo.request('POST /repos/{owner}/{repo}/issues', {
      owner: this.repoOwner,
      repo: this.repoName,
      title,
      body,
      assignees: (assignees || []).filter(Boolean)
    });
    return {
      number: res.data.number,
      id: res.data.node_id,
      url: res.data.html_url
    };
  }

  private async assignIssueToProject(projectId: string, contentId: string) {
    if (!projectId) {
      this.logger.warn(
        'PROJECT_ID no está configurado. Saltando asignación a proyecto.'
      );
      return;
    }

    try {
      const mutation = `
        mutation($projectId: ID!, $contentId: ID!) {
          addProjectV2ItemById(input: {projectId: $projectId, contentId: $contentId}) {
            item {
              id
            }
          }
        }
      `;

      const result: any = await this.octo.graphql(mutation, {
        projectId,
        contentId
      });

      this.logger.log(
        `Issue ${contentId} asignado al proyecto ${projectId}. Item ID: ${result?.addProjectV2ItemById?.item?.id}`
      );
    } catch (error) {
      this.logger.error(
        `Error al asignar issue ${contentId} al proyecto ${projectId}:`,
        error
      );
    }
  }

  async createRFC(dto: CreateRfcDto) {
    const body = this.issueBody(dto);
    const issue = await this.createIssue(dto.title, body, dto.assignees);

    await this.assignIssueToProject(this.projectId, issue.id);

    await this.octo.request(
      'PATCH /repos/{owner}/{repo}/issues/{issue_number}',
      {
        owner: this.repoOwner,
        repo: this.repoName,
        issue_number: issue.number,
        state: 'closed',
        state_reason: 'not_planned'
      }
    );

    const labels: string[] = ['rfc'];
    const tipo = this.norm(dto.tipo);
    const riesgo = this.norm(dto.riesgo);

    if (tipo) {
      if (['estandar', 'estándar'].includes(tipo)) labels.push('tipo:estandar');
      else if (tipo === 'normal') labels.push('tipo:normal');
      else if (['emergencia', 'urgente'].includes(tipo))
        labels.push('tipo:emergencia');
    }
    if (riesgo) {
      if (riesgo === 'bajo') labels.push('riesgo:bajo');
      else if (riesgo === 'medio') labels.push('riesgo:medio');
      else if (riesgo === 'alto') labels.push('riesgo:alto');
    }

    await this.octo.request(
      'POST /repos/{owner}/{repo}/issues/{issue_number}/labels',
      {
        owner: this.repoOwner,
        repo: this.repoName,
        issue_number: issue.number,
        labels
      }
    );

    return {
      issueNumber: issue.number,
      issueUrl: issue.url
    };
  }
}
