import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiKeyGuard } from './api-key.guard';

function createContext(apiKeyHeader?: string): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        header: (name: string) => {
          if (name === 'x-api-key') {
            return apiKeyHeader;
          }

          return undefined;
        },
      }),
    }),
  } as unknown as ExecutionContext;
}

describe('ApiKeyGuard', () => {
  it('debe permitir cuando API_KEY no esta configurada', () => {
    const configService = {
      get: jest.fn().mockReturnValue(undefined),
    } as unknown as ConfigService;

    const guard = new ApiKeyGuard(configService);
    const context = createContext();

    expect(guard.canActivate(context)).toBe(true);
  });

  it('debe permitir cuando el header coincide con API_KEY', () => {
    const configService = {
      get: jest.fn().mockReturnValue('test-api-key'),
    } as unknown as ConfigService;

    const guard = new ApiKeyGuard(configService);
    const context = createContext('test-api-key');

    expect(guard.canActivate(context)).toBe(true);
  });

  it('debe rechazar cuando el header no coincide', () => {
    const configService = {
      get: jest.fn().mockReturnValue('test-api-key'),
    } as unknown as ConfigService;

    const guard = new ApiKeyGuard(configService);
    const context = createContext('wrong-key');

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });
});
