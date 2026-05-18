import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { HealthModule } from './modules/health/health.module';
import { LeadsModule } from './modules/leads/leads.module';
import { LangchainModule } from './shared/infrastructure/ai/langchain/langchain.module';
import { RequestLoggingMiddleware } from './shared/infrastructure/http/request-logging.middleware';
import { PrismaModule } from './shared/infrastructure/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: Number(
              configService.get<string>('THROTTLE_TTL_MS') ?? '60000',
            ),
            limit: Number(configService.get<string>('THROTTLE_LIMIT') ?? '100'),
          },
        ],
      }),
    }),
    LangchainModule,
    PrismaModule,
    HealthModule,
    LeadsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestLoggingMiddleware).forRoutes({
      path: '*path',
      method: RequestMethod.ALL,
    });
  }
}
