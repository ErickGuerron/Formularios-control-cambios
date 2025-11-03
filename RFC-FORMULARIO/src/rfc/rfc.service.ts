/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Octokit } from '@octokit/core';
import { graphql } from '@octokit/graphql';
import { CreateRfcDto } from './dto/create-rfc.dto';

type Gql = <T = any>(q: string, v?: Record<string, any>) => Promise<T>;

@Injectable()
export class RfcService {
  private readonly repoOwner: string;
  private readonly repoName: string;
  private readonly logger = new Logger(RfcService.name);

  private octo!: Octokit;
  private gql!: Gql;

  constructor(cfg: ConfigService) {
    this.repoOwner = cfg.get<string>('REPO_OWNER')!;
    this.repoName = cfg.get<string>('REPO_NAME')!;
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
}
