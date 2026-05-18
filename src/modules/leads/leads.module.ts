import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/infrastructure/prisma/prisma.module';
import { ApiKeyGuard } from '../../shared/infrastructure/auth/api-key.guard';
import { CreateLeadUseCase } from './application/use-cases/create-lead.use-case';
import { DeleteLeadUseCase } from './application/use-cases/delete-lead.use-case';
import { GenerateLeadsSummaryUseCase } from './application/use-cases/generate-leads-summary.use-case';
import { GetLeadByIdUseCase } from './application/use-cases/get-lead-by-id.use-case';
import { GetLeadsStatsUseCase } from './application/use-cases/get-leads-stats.use-case';
import { ListLeadsUseCase } from './application/use-cases/list-leads.use-case';
import { UpdateLeadUseCase } from './application/use-cases/update-lead.use-case';
import { LEAD_REPOSITORY } from './domain/repositories/lead.repository';
import { LEAD_SUMMARY_SERVICE } from './domain/services/lead-summary.service';
import { LangchainLeadSummaryService } from './infrastructure/ai/langchain-lead-summary.service';
import { PrismaLeadRepository } from './infrastructure/persistence/prisma-lead.repository';
import { LeadsController } from './presentation/http/leads.controller';

@Module({
  imports: [PrismaModule],
  controllers: [LeadsController],
  providers: [
    CreateLeadUseCase,
    ListLeadsUseCase,
    GetLeadByIdUseCase,
    UpdateLeadUseCase,
    DeleteLeadUseCase,
    GetLeadsStatsUseCase,
    GenerateLeadsSummaryUseCase,
    ApiKeyGuard,
    PrismaLeadRepository,
    LangchainLeadSummaryService,
    {
      provide: LEAD_REPOSITORY,
      useExisting: PrismaLeadRepository,
    },
    {
      provide: LEAD_SUMMARY_SERVICE,
      useExisting: LangchainLeadSummaryService,
    },
  ],
})
export class LeadsModule {}
