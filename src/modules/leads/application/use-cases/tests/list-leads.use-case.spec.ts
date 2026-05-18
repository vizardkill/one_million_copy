import { LeadSource } from '../../../domain/enums/lead-source.enum';
import { ListLeadsUseCase } from '../list-leads.use-case';
import { createRepositoryMock, mockLead } from './use-case-test.utils';

describe('ListLeadsUseCase', () => {
  it('debe listar leads paginados con filtros', async () => {
    const repository = createRepositoryMock();
    const response = {
      items: [mockLead],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };

    repository.findMany.mockResolvedValue(response);

    const useCase = new ListLeadsUseCase(repository);
    const query = {
      page: 1,
      limit: 20,
      source: LeadSource.INSTAGRAM,
      startDate: new Date('2026-01-01T00:00:00.000Z'),
      endDate: new Date('2026-12-31T23:59:59.999Z'),
    };

    const result = await useCase.execute(query);

    expect(repository.findMany.mock.calls).toEqual([[query]]);
    expect(result).toEqual(response);
  });
});
