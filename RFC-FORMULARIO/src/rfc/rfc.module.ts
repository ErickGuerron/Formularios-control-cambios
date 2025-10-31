/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GithubModule,
  GITHUB_GRAPHQL,
  GITHUB_OCTOKIT
} from '../../github/github.module';
import { RfcController } from './rfc.controller';
import { RfcService } from './rfc.service';

@Module({
  imports: [GithubModule],
  controllers: [RfcController],
  providers: [
    {
      provide: RfcService,
      useFactory: (cfg: ConfigService, octo: any, gql: any) => {
        const svc = new RfcService(cfg) as any;
        svc.octo = octo;
        svc.gql = gql;
        return svc as RfcService;
      },
      inject: [ConfigService, GITHUB_OCTOKIT, GITHUB_GRAPHQL]
    }
  ]
})
export class RfcModule {}
