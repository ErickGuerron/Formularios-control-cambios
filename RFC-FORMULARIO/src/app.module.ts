import { GithubModule } from './../github/github.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RfcModule } from './rfc/rfc.module';
import { IssuesModule } from './issues/issues.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    GithubModule,
    RfcModule,
    IssuesModule
  ]
})
export class AppModule {}
