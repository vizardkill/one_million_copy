import { ConflictException } from '@nestjs/common';
import { CreateLeadUseCase } from '../create-lead.use-case';
import { createRepositoryMock, mockLead } from './use-case-test.utils';

describe('CreateLeadUseCase', () => {
  it('debe crear el lead cuando el email no existe', async () => {
    const repository = createRepositoryMock();
    repository.findByEmail.mockResolvedValue(null);
    repository.create.mockResolvedValue(mockLead);

    const useCase = new CreateLeadUseCase(repository);
    const command = {
      name: mockLead.name,
      email: mockLead.email,
      phone: mockLead.phone,
      source: mockLead.source,
      productInterest: mockLead.productInterest,
      budget: mockLead.budget,
    };

    const result = await useCase.execute(command);

    expect(repository.findByEmail.mock.calls).toEqual([[mockLead.email]]);
    expect(repository.create.mock.calls).toEqual([[command]]);
    expect(result).toEqual(mockLead);
  });

  it('debe lanzar conflicto cuando el email ya existe', async () => {
    const repository = createRepositoryMock();
    repository.findByEmail.mockResolvedValue(mockLead);

    const useCase = new CreateLeadUseCase(repository);

    await expect(
      useCase.execute({
        name: mockLead.name,
        email: mockLead.email,
        phone: mockLead.phone,
        source: mockLead.source,
        productInterest: mockLead.productInterest,
        budget: mockLead.budget,
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(repository.create.mock.calls).toHaveLength(0);
  });
});
