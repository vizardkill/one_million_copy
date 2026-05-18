import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LangchainService } from './langchain.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [LangchainService],
  exports: [LangchainService],
})
export class LangchainModule {}
