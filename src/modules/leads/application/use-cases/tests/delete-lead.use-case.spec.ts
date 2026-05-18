import { NotFoundException } from '@nestjs/common';
import { DeleteLeadUseCase } from '../delete-lead.use-case';
import { createRepositoryMock, mockLead } from './use-case-test.utils';

describe('DeleteLeadUseCase', () => {
  it('debe eliminar lead cuando existe', async () => {
    const repository = createRepositoryMock();
    repository.softDelete.mockResolvedValue(true);

    const useCase = new DeleteLeadUseCase(repository);

    await expect(useCase.execute(mockLead.id)).resolves.toBeUndefined();
    expect(repository.softDelete.mock.calls).toEqual([[mockLead.id]]);
  });

  it('debe lanzar not found cuando el lead no existe', async () => {
    const repository = createRepositoryMock();
    repository.softDelete.mockResolvedValue(false);

    const useCase = new DeleteLeadUseCase(repository);

    await expect(useCase.execute('missing-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
