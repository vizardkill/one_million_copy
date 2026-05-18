import { ConflictException, NotFoundException } from '@nestjs/common';
import { UpdateLeadUseCase } from '../update-lead.use-case';
import {
  createRepositoryMock,
  mockLead,
  secondMockLead,
} from './use-case-test.utils';

describe('UpdateLeadUseCase', () => {
  it('debe lanzar not found cuando el lead no existe', async () => {
    const repository = createRepositoryMock();
    repository.findById.mockResolvedValue(null);

    const useCase = new UpdateLeadUseCase(repository);

    await expect(
      useCase.execute('missing-id', { name: 'Nuevo nombre' }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(repository.update.mock.calls).toHaveLength(0);
  });

  it('debe lanzar conflicto cuando intenta usar un email de otro lead', async () => {
    const repository = createRepositoryMock();
    repository.findById.mockResolvedValue(mockLead);
    repository.findByEmail.mockResolvedValue(secondMockLead);

    const useCase = new UpdateLeadUseCase(repository);

    await expect(
      useCase.execute(mockLead.id, { email: secondMockLead.email }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(repository.update.mock.calls).toHaveLength(0);
  });

  it('debe actualizar lead cuando los datos son validos', async () => {
    const repository = createRepositoryMock();
    const updatedLead = {
      ...mockLead,
      name: 'Laura Actualizada',
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    };

    repository.findById.mockResolvedValue(mockLead);
    repository.update.mockResolvedValue(updatedLead);

    const useCase = new UpdateLeadUseCase(repository);
    const command = {
      name: updatedLead.name,
      productInterest: 'Programa premium',
    };

    const result = await useCase.execute(mockLead.id, command);

    expect(repository.findByEmail.mock.calls).toHaveLength(0);
    expect(repository.update.mock.calls).toEqual([[mockLead.id, command]]);
    expect(result).toEqual(updatedLead);
  });

  it('debe lanzar not found si el repositorio no retorna lead actualizado', async () => {
    const repository = createRepositoryMock();

    repository.findById.mockResolvedValue(mockLead);
    repository.findByEmail.mockResolvedValue(null);
    repository.update.mockResolvedValue(null);

    const useCase = new UpdateLeadUseCase(repository);

    await expect(
      useCase.execute(mockLead.id, { email: 'nuevo@email.com' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
