/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Octokit } from '@octokit/core';
import { graphql } from '@octokit/graphql';
import { CreateRfcDto } from './dto/create-rfc.dto';
import { CreateUserChangeDto } from './dto/create-user-change.dto';
import { UpdateCreateUserChangeDto } from './dto/update-user-change.dto';

type Gql = <T = any>(q: string, v?: Record<string, any>) => Promise<T>;

@Injectable()
export class RfcService {
  private readonly repoOwner: string;
  private readonly repoName: string;

  private octo!: Octokit;
  private gql!: Gql;

  constructor(cfg: ConfigService) {
    this.repoName = cfg.get<string>('REPO_NAME')!;
    this.repoOwner = cfg.get<string>('REPO_OWNER')!;
    const token = cfg.get<string>('GITHUB_TOKEN')!;
    this.octo = new Octokit({ auth: token });
    this.gql = graphql.defaults({
      headers: { authorization: `token ${token}` }
    }) as Gql;
  }

  private norm(s?: string) {
    return (s ?? '')
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .trim()
      .toLowerCase();
  }

  // --- Lógica de CreateRfcDto (sin cambios) ---
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
      assignees: (assignees ?? []).filter(Boolean).slice(0, 2)
    });
    return {
      number: res.data.number,
      id: res.data.node_id,
      url: res.data.html_url
    };
  }

  async createRFC(dto: CreateRfcDto) {
    const issue = await this.createIssue(
      dto.title,
      this.issueBody(dto),
      dto.assignees
    );

    const labels: string[] = ['rfc'];
    const tipo = this.norm(dto.tipo);
    const riesgo = this.norm(dto.riesgo);
    if (['estandar', 'estándar'].includes(tipo)) labels.push('tipo:estandar');
    else if (tipo === 'normal') labels.push('tipo:normal');
    else if (['emergencia', 'urgente'].includes(tipo))
      labels.push('tipo:emergencia');
    if (riesgo === 'bajo') labels.push('riesgo:bajo');
    else if (riesgo === 'medio') labels.push('riesgo:medio');
    else if (riesgo === 'alto') labels.push('riesgo:alto');

    if (labels.length) {
      await this.octo.request(
        'POST /repos/{owner}/{repo}/issues/{issue_number}/labels',
        {
          owner: this.repoOwner,
          repo: this.repoName,
          issue_number: issue.number,
          labels
        }
      );
    }

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

    return { issueNumber: issue.number, issueUrl: issue.url };
  }

  async listAssignableUsers() {
    const out: Array<{
      login: string;
      name: string | null;
      avatarUrl: string;
    }> = [];
    let after: string | null = null;
    for (;;) {
      const q = `
        query($owner:String!, $name:String!, $after:String) {
          repository(owner:$owner, name:$name) {
            assignableUsers(first:100, after:$after) {
              nodes { login name avatarUrl }
              pageInfo { hasNextPage endCursor }
            }
          }
        }`;
      const r = await this.gql(q, {
        owner: this.repoOwner,
        name: this.repoName,
        after
      });
      const nodes = r?.repository?.assignableUsers?.nodes || [];
      out.push(
        ...nodes.map((n: any) => ({
          login: n.login,
          name: n.name ?? null,
          avatarUrl: n.avatarUrl
        }))
      );
      const pi = r?.repository?.assignableUsers?.pageInfo;
      if (!pi?.hasNextPage) break;
      after = pi.endCursor;
    }
    return out;
  }

  private upsertSection(src: string, label: string, value: string | string[]) {
    const h = `### ${label}`;
    const re = new RegExp(
      `^###\\s*${label}\\s*\\n+[\\s\\S]*?(?=\\n###\\s|$)`,
      'im'
    );
    const block = `${h}\n\n${value || ''}`;
    if (!src) return block;
    return re.test(src)
      ? src.replace(re, block)
      : src.trim()
        ? `${src.trim()}\n\n${block}`
        : block;
  }

  // --- LÓGICA DE USUARIO ACTUALIZADA ---

  /**
   * Construye el body del issue de usuario.
   * IMPORTANTE: Los encabezados (### ...) deben coincidir EXACTAMENTE
   * con lo que la GitHub Action (job: process_rfc_on_github) espera
   * en la función `grab` dentro del bloque `if (hasUserLabel)`.
   */
  private buildUserIssueBody(d: CreateUserChangeDto) {
    return [
      `### Formulario\n\n${d.formName}`,
      `### Solicitante\n\n${d.requesterName}`,
      `### Email\n\n${d.email}`, // El Action leerá este campo
      `### Fecha de solicitud\n\n${d.requestDate}`,
      `### Área / Departamento\n\n${d.department || ''}`, // Mapea a vDept
      `### Motivo de cambio\n\n${d.changeType}`, // Mapea a vReason (será traducido)
      `### Prioridad\n\n${d.priorityName}`, // Mapea a vPrior
      `### Descripción del cambio solicitado\n\n${d.description}`, // Mapea a vDesc
      `### Motivo del cambio\n\n${d.reason}`, // Mapea a vExpl (OJO: 'del' cambio)
      `### Observaciones adicionales\n\n${d.notes || ''}` // Mapea a vNotes
    ].join('\n\n');
  }

  async createUserRFC(dto: CreateUserChangeDto) {
    const body = this.buildUserIssueBody(dto);
    const issue = await this.createIssue(
      dto.title, // El frontend asigna formName a title
      body,
      dto.assignees
    );

    await this.octo.request(
      'POST /repos/{owner}/{repo}/issues/{issue_number}/labels',
      {
        owner: this.repoOwner,
        repo: this.repoName,
        issue_number: issue.number,
        labels: ['user', 'rfc'] // Añade ambas etiquetas
      }
    );

    // --- ¡NUEVO! Cierra el issue al crearlo ---
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
    // --- Fin del cambio ---

    return { issueNumber: issue.number, issueUrl: issue.url };
  }

  async completeUserRFC(issueNumber: number, dto: UpdateCreateUserChangeDto) {
    const { data: issue } = await this.octo.request(
      'GET /repos/{owner}/{repo}/issues/{issue_number}',
      {
        owner: this.repoOwner,
        repo: this.repoName,
        issue_number: issueNumber
      }
    );
    let body = issue.body || '';

    // --- Campos del Formulario de Usuario (con labels correctos) ---
    if (dto.formName)
      body = this.upsertSection(body, 'Formulario', dto.formName);
    if (dto.requesterName)
      body = this.upsertSection(body, 'Solicitante', dto.requesterName);
    if (dto.department !== undefined)
      body = this.upsertSection(
        body,
        'Área / Departamento',
        dto.department || ''
      );
    if (dto.email) body = this.upsertSection(body, 'Email', dto.email);
    if (dto.requestDate)
      body = this.upsertSection(body, 'Fecha de solicitud', dto.requestDate);
    if (dto.changeType)
      body = this.upsertSection(body, 'Motivo de cambio', dto.changeType);
    if (dto.priorityName)
      body = this.upsertSection(body, 'Prioridad', dto.priorityName);
    if (dto.description)
      body = this.upsertSection(
        body,
        'Descripción del cambio solicitado',
        dto.description
      );
    if (dto.reason)
      body = this.upsertSection(body, 'Motivo del cambio', dto.reason);
    if (dto.notes !== undefined)
      body = this.upsertSection(
        body,
        'Observaciones adicionales',
        dto.notes || ''
      );

    // --- Campos del Formulario CCC (para /actualizar) ---
    if (dto.impact) body = this.upsertSection(body, 'Impact', dto.impact);
    if (dto.implementationPlan)
      body = this.upsertSection(
        body,
        'Implementation Plan',
        dto.implementationPlan
      );
    if (dto.rollbackPlanning)
      body = this.upsertSection(
        body,
        'RollBack Planning',
        dto.rollbackPlanning
      );
    if (dto.testPlanning)
      body = this.upsertSection(body, 'Test Planning', dto.testPlanning);
    if (dto.approvers)
      body = this.upsertSection(body, 'Approvers', dto.approvers);
    if (dto.startDate)
      body = this.upsertSection(body, 'Start date', dto.startDate);
    if (dto.targetDate)
      body = this.upsertSection(body, 'Target date', dto.targetDate);

    if (dto.reviewer)
      body = this.upsertSection(body, 'Reviewer', dto.reviewer.join(', '));

    const patch: any = {
      owner: this.repoOwner,
      repo: this.repoName,
      issue_number: issueNumber,
      body
    };
    if (dto.title) patch.title = dto.title;
    if (dto.assignees)
      patch.assignees = dto.assignees.filter(Boolean).slice(0, 2);

    await this.octo.request(
      'PATCH /repos/{owner}/{repo}/issues/{issue_number}',
      patch
    );

    const labels = (issue.labels || []).map((l: any) =>
      (l.name || '').toLowerCase()
    );
    const labelsToAdd: string[] = [];
    if (!labels.includes('user')) {
      labelsToAdd.push('user');
    }
    if (!labels.includes('rfc')) {
      labelsToAdd.push('rfc');
    }

    if (labelsToAdd.length > 0) {
      await this.octo.request(
        'POST /repos/{owner}/{repo}/issues/{issue_number}/labels',
        {
          owner: this.repoOwner,
          repo: this.repoName,
          issue_number: issueNumber,
          labels: labelsToAdd
        }
      );
    }

    return { issueNumber, updated: true };
  }
}
