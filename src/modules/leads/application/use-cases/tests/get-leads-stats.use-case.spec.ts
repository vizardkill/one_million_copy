import { LeadSource } from '../../../domain/enums/lead-source.enum';
import { GetLeadsStatsUseCase } from '../get-leads-stats.use-case';
import { createRepositoryMock } from './use-case-test.utils';

describe('GetLeadsStatsUseCase', () => {
  it('debe retornar estadisticas desde el repositorio', async () => {
    const repository = createRepositoryMock();
    const stats = {
      totalLeads: 11,
      leadsBySource: [
        { source: LeadSource.INSTAGRAM, total: 4 },
        { source: LeadSource.FACEBOOK, total: 3 },
        { source: LeadSource.LANDING_PAGE, total: 2 },
        { source: LeadSource.REFERIDO, total: 1 },
        { source: LeadSource.OTRO, total: 1 },
      ],
      averageBudgetUsd: 523.45,
      leadsLast7Days: 5,
    };

    repository.getStats.mockResolvedValue(stats);

    const useCase = new GetLeadsStatsUseCase(repository);
    const result = await useCase.execute();

    expect(repository.getStats.mock.calls).toHaveLength(1);
    expect(result).toEqual(stats);
  });
});
