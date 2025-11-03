/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
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
  private readonly projectTitle: string;
  private readonly projectIdCfg: string | null;
  private readonly orgLogin: string | null;
  private readonly userLogin: string | null;
  private readonly projectNumber: number | null;
  private readonly logger = new Logger(RfcService.name);

  private octo!: Octokit;
  private gql!: Gql;

  constructor(private readonly cfg: ConfigService) {
    this.repoOwner = this.cfg.get<string>('REPO_OWNER')!;
    this.repoName = this.cfg.get<string>('REPO_NAME')!;
    this.projectTitle = this.cfg.get<string>('PROJECT_TITLE') || '';
    this.projectIdCfg = this.cfg.get<string>('PROJECT_ID') || null;
    this.orgLogin = this.cfg.get<string>('ORG_LOGIN') || null;
    this.userLogin = this.cfg.get<string>('USER_LOGIN') || null;
    this.projectNumber = this.cfg.get<number>('PROJECT_NUMBER') ?? null;

    const token = this.cfg.get<string>('GITHUB_TOKEN')!;
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

  private async resolveProjectId(): Promise<string | null> {
    if (this.projectIdCfg && /^PVT_/i.test(this.projectIdCfg))
      return this.projectIdCfg;

    if (this.orgLogin && this.projectNumber) {
      const q = `
        query($org:String!, $num:Int!) {
          organization(login:$org) { projectV2(number:$num) { id title } }
        }
      `;
      const r = await this.gql(q, {
        org: this.orgLogin,
        num: this.projectNumber
      });
      const id = r?.organization?.projectV2?.id || null;
      if (id) return id;
    }

    if (this.userLogin && this.projectNumber) {
      const q = `
        query($user:String!, $num:Int!) {
          user(login:$user) { projectV2(number:$num) { id title } }
        }
      `;
      const r = await this.gql(q, {
        user: this.userLogin,
        num: this.projectNumber
      });
      const id = r?.user?.projectV2?.id || null;
      if (id) return id;
    }

    if ((this.orgLogin || this.userLogin) && this.projectTitle) {
      const qOrg = `
        query($org:String!) {
          organization(login:$org) { projectsV2(first:50, query:"") { nodes { id title } } }
        }
      `;
      const qUser = `
        query($user:String!) {
          user(login:$user) { projectsV2(first:50, query:"") { nodes { id title } } }
        }
      `;
      if (this.orgLogin) {
        const r = await this.gql(qOrg, { org: this.orgLogin });
        const hit = r?.organization?.projectsV2?.nodes?.find(
          (p: any) => (p?.title || '').trim() === this.projectTitle.trim()
        );
        if (hit?.id) return hit.id;
      }
      if (this.userLogin) {
        const r = await this.gql(qUser, { user: this.userLogin });
        const hit = r?.user?.projectsV2?.nodes?.find(
          (p: any) => (p?.title || '').trim() === this.projectTitle.trim()
        );
        if (hit?.id) return hit.id;
      }
    }
    return null;
  }

  private async createIssue(title: string, body: string, assignees?: string[]) {
    const res = await this.octo.request('POST /repos/{owner}/{repo}/issues', {
      owner: this.repoOwner,
      repo: this.repoName,
      title,
      body,
      assignees: (assignees || []).filter(Boolean).slice(0, 10)
    });
    return {
      number: res.data.number,
      id: res.data.node_id,
      url: res.data.html_url
    };
  }

  private async assignIssueToProject(contentId: string) {
    const projectId = await this.resolveProjectId();
    if (!projectId) {
      this.logger.warn(
        'No se pudo resolver PROJECT_ID. Saltando asignación a proyecto.'
      );
      return { projectId: null, itemId: null };
    }
    const mutation = `
      mutation($projectId: ID!, $contentId: ID!) {
        addProjectV2ItemById(input: {projectId: $projectId, contentId: $contentId}) {
          item { id }
        }
      }
    `;
    const r: any = await this.gql(mutation, { projectId, contentId });
    const itemId = r?.addProjectV2ItemById?.item?.id || null;
    return { projectId, itemId };
  }

  private async getStatusFieldAndOption(projectId: string, statusName: string) {
    const q = `
      query($projectId: ID!) {
        node(id:$projectId) {
          ... on ProjectV2 {
            fields(first:100) {
              nodes {
                ... on ProjectV2SingleSelectField {
                  id
                  name
                  options { id name }
                }
                ... on ProjectV2FieldCommon { id name }
              }
            }
          }
        }
      }
    `;
    const r: any = await this.gql(q, { projectId });
    const fields = r?.node?.fields?.nodes || [];
    const target =
      fields.find((f: any) => (f?.name || '').toLowerCase() === 'status') ||
      fields.find((f: any) => (f?.name || '').toLowerCase() === 'estado');
    if (!target?.options) return { fieldId: null, optionId: null };
    const opt = target.options.find(
      (o: any) => (o?.name || '').toLowerCase() === statusName.toLowerCase()
    );
    return { fieldId: target.id || null, optionId: opt?.id || null };
  }

  private async setProjectItemStatus(
    projectId: string,
    itemId: string,
    statusName: string
  ) {
    const { fieldId, optionId } = await this.getStatusFieldAndOption(
      projectId,
      statusName
    );
    if (!fieldId || !optionId) {
      this.logger.warn(
        `No se pudo resolver Status/Backlog en el proyecto ${projectId}.`
      );
      return;
    }
    const m = `
      mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
        updateProjectV2ItemFieldValue(input:{
          projectId:$projectId,
          itemId:$itemId,
          fieldId:$fieldId,
          value:{ singleSelectOptionId:$optionId }
        }) {
          projectV2Item { id }
        }
      }
    `;
    await this.gql(m, { projectId, itemId, fieldId, optionId });
  }

  async createRFC(dto: CreateRfcDto) {
    const body = this.issueBody(dto);
    const issue = await this.createIssue(dto.title, body, dto.assignees);

    const { projectId, itemId } = await this.assignIssueToProject(issue.id);
    if (projectId && itemId) {
      await this.setProjectItemStatus(projectId, itemId, 'Backlog');
    }

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
        }
      `;
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
