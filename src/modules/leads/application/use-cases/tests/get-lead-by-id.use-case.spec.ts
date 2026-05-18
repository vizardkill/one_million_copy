import { NotFoundException } from '@nestjs/common';
import { GetLeadByIdUseCase } from '../get-lead-by-id.use-case';
import { createRepositoryMock, mockLead } from './use-case-test.utils';

describe('GetLeadByIdUseCase', () => {
  it('debe retornar lead cuando existe', async () => {
    const repository = createRepositoryMock();
    repository.findById.mockResolvedValue(mockLead);

    const useCase = new GetLeadByIdUseCase(repository);

    const result = await useCase.execute(mockLead.id);

    expect(repository.findById.mock.calls).toEqual([[mockLead.id]]);
    expect(result).toEqual(mockLead);
  });

  it('debe lanzar not found cuando no existe', async () => {
    const repository = createRepositoryMock();
    repository.findById.mockResolvedValue(null);

    const useCase = new GetLeadByIdUseCase(repository);

    await expect(useCase.execute('missing-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
