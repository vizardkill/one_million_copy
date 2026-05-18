import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const configuredApiKey = this.configService.get<string>('API_KEY');

    if (!configuredApiKey) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const providedApiKey = request.header('x-api-key');

    if (!providedApiKey || providedApiKey !== configuredApiKey) {
      throw new UnauthorizedException('API key invalida o ausente.');
    }

    return true;
  }
}
