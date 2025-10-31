import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Octokit } from '@octokit/core';
import { graphql } from '@octokit/graphql';

export const GITHUB_OCTOKIT = 'GITHUB_OCTOKIT';
export const GITHUB_GRAPHQL = 'GITHUB_GRAPHQL';

@Module({
  providers: [
    {
      provide: GITHUB_OCTOKIT,
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) =>
        new Octokit({ auth: cfg.get<string>('GH_TOKEN') })
    },
    {
      provide: GITHUB_GRAPHQL,
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) =>
        graphql.defaults({
          headers: { authorization: `token ${cfg.get<string>('GH_TOKEN')}` }
        })
    }
  ],
  exports: [GITHUB_OCTOKIT, GITHUB_GRAPHQL]
})
export class GithubModule {}
