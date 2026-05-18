import { LeadSource } from '../../../domain/enums/lead-source.enum';
import { GenerateLeadsSummaryUseCase } from '../generate-leads-summary.use-case';
import {
  createRepositoryMock,
  createSummaryServiceMock,
  mockLead,
  secondMockLead,
} from './use-case-test.utils';

describe('GenerateLeadsSummaryUseCase', () => {
  it('debe generar resumen usando filtros del command', async () => {
    const repository = createRepositoryMock();
    const summaryService = createSummaryServiceMock();
    const startDate = new Date('2026-01-01T00:00:00.000Z');
    const endDate = new Date('2026-12-31T23:59:59.999Z');
    const command = {
      source: LeadSource.FACEBOOK,
      startDate,
      endDate,
    };
    const leads = [mockLead, secondMockLead];

    repository.findForSummary.mockResolvedValue(leads);
    summaryService.generateSummary.mockResolvedValue('Resumen ejecutivo.');

    const useCase = new GenerateLeadsSummaryUseCase(repository, summaryService);

    const result = await useCase.execute(command);

    expect(repository.findForSummary.mock.calls).toEqual([
      [
        {
          source: command.source,
          startDate: command.startDate,
          endDate: command.endDate,
        },
      ],
    ]);
    expect(summaryService.generateSummary.mock.calls).toEqual([
      [
        leads,
        {
          source: command.source,
          startDate: command.startDate,
          endDate: command.endDate,
        },
      ],
    ]);
    expect(result).toBe('Resumen ejecutivo.');
  });

  it('debe delegar resumen aunque no haya leads', async () => {
    const repository = createRepositoryMock();
    const summaryService = createSummaryServiceMock();

    repository.findForSummary.mockResolvedValue([]);
    summaryService.generateSummary.mockResolvedValue(
      'No se encontraron leads para el filtro solicitado.',
    );

    const useCase = new GenerateLeadsSummaryUseCase(repository, summaryService);

    const result = await useCase.execute({});

    expect(summaryService.generateSummary.mock.calls).toEqual([[[], {}]]);
    expect(result).toBe('No se encontraron leads para el filtro solicitado.');
  });
});
