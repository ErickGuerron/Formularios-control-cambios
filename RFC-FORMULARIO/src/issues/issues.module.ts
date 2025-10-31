/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GithubModule, GITHUB_OCTOKIT } from './../../github/github.module';
import { IssuesController } from './issues.controller';
import { IssuesService } from './issues.service';

@Module({
  imports: [GithubModule],
  controllers: [IssuesController],
  providers: [
    {
      provide: IssuesService,
      useFactory: (cfg: ConfigService, octo: any) => {
        const svc = new IssuesService(cfg) as any;
        svc.octo = octo;
        return svc as IssuesService;
      },
      inject: [ConfigService, GITHUB_OCTOKIT]
    }
  ]
})
export class IssuesModule {}
