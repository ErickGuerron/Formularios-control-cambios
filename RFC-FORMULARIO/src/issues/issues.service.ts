/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Octokit } from '@octokit/core';

@Injectable()
export class IssuesService {
  constructor(private readonly cfg: ConfigService) {}
  public octo!: Octokit;

  private get owner() {
    return this.cfg.get<string>('REPO_OWNER')!;
  }
  private get repo() {
    return this.cfg.get<string>('REPO_NAME')!;
  }

  async listIssues(
    state: 'open' | 'closed' | 'all' = 'all',
    state_reason?: string,
    page = 1,
    per_page = 30
  ) {
    const res = await this.octo.request('GET /repos/{owner}/{repo}/issues', {
      owner: this.owner,
      repo: this.repo,
      state,
      page,
      per_page
    });

    let issues = res.data;

    if (state_reason === 'denied') {
      issues = issues.filter((i) =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (i.labels || []).some((l: any) => l.name === 'denied')
      );
    } else if (state === 'closed' && state_reason) {
      issues = issues.filter(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (i: any) => i.state_reason === state_reason
      );
    }

    return (
      issues
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        .filter((i) => !(i as any).pull_request)
        .map((i) => ({
          number: i.number,
          title: i.title,
          state: i.state,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          state_reason: (i as any).state_reason ?? null,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          labels: (i.labels || []).map((l: any) => l.name),
          assignees: (i.assignees || []).map((a) => a.login),
          url: i.html_url
        }))
    );
  }

  async setStateNumber(
    issue_number: number,
    body: {
      action: 'approve' | 'denied' | 'close_not_planned';
    }
  ) {
    const { action } = body;

    if (action === 'approve') {
      await this.octo.request(
        'PATCH /repos/{owner}/{repo}/issues/{issue_number}',
        {
          owner: this.owner,
          repo: this.repo,
          issue_number,
          state: 'open',
          state_reason: 'reopened'
        }
      );
      return { issue_number, state: 'open', state_reason: 'reopened' };
    }

    if (action === 'close_not_planned') {
      await this.octo.request(
        'PATCH /repos/{owner}/{repo}/issues/{issue_number}',
        {
          owner: this.owner,
          repo: this.repo,
          issue_number,
          state: 'closed',
          state_reason: 'not_planned'
        }
      );
      return { issue_number, state: 'closed', state_reason: 'not_planned' };
    }

    if (action === 'denied') {
      await this.octo
        .request('POST /repos/{owner}/{repo}/issues/{issue_number}/labels', {
          owner: this.owner,
          repo: this.repo,
          issue_number,
          labels: ['denied']
        })
        .catch(() => {});
      await this.octo.request(
        'PATCH /repos/{owner}/{repo}/issues/{issue_number}',
        {
          owner: this.owner,
          repo: this.repo,
          issue_number,
          state: 'closed',
          state_reason: 'not_planned'
        }
      );
      return {
        issue_number,
        state: 'closed',
        state_reason: 'not_planned',
        labels: ['denied']
      };
    }

    throw new Error('Acción no soportada');
  }
}
