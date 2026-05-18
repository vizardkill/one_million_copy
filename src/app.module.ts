import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/health/health.module';
import { UsersModule } from './modules/users/users.module';
import { LangchainModule } from './shared/infrastructure/ai/langchain/langchain.module';
import { PrismaModule } from './shared/infrastructure/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LangchainModule,
    PrismaModule,
    HealthModule,
    UsersModule,
  ],
})
export class AppModule {}
