import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';

const DEFAULT_OPENAI_MODEL = 'gpt-4.1-mini';
const DEFAULT_OPENROUTER_MODEL = 'nvidia/nemotron-3-nano-30b-a3b:free';
const DEFAULT_OPENAI_TEMPERATURE = 0;
const DEFAULT_OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const DEFAULT_OPENROUTER_ATTEMPTS_PER_MODEL = 1;
const DEFAULT_OPENAI_ATTEMPTS_PER_MODEL = 3;

type LlmProvider = 'openai' | 'openrouter';

@Injectable()
export class LangchainService {
  private readonly chatModels = new Map<string, ChatOpenAI>();
  private readonly logger = new Logger(LangchainService.name);

  constructor(private readonly configService: ConfigService) {}

  isConfigured(): boolean {
    return this.resolveApiKey().length > 0;
  }

  getProvider(): LlmProvider {
    return this.resolveProvider();
  }

  getModel(): string {
    return this.resolveModel(this.resolveProvider());
  }

  getCandidateModels(): string[] {
    const provider = this.resolveProvider();
    const primaryModel = this.resolveModel(provider);

    if (provider !== 'openrouter') {
      return [primaryModel];
    }

    const fallbackModelsRaw =
      this.configService.get<string>('OPENROUTER_FALLBACK_MODELS') ?? '';
    const fallbackModels = fallbackModelsRaw
      .split(',')
      .map((model) => model.trim())
      .filter((model) => model.length > 0);

    return [...new Set([primaryModel, ...fallbackModels])];
  }

  getAttemptsPerModel(): number {
    if (this.resolveProvider() !== 'openrouter') {
      return DEFAULT_OPENAI_ATTEMPTS_PER_MODEL;
    }

    const rawValue =
      this.configService.get<string>('OPENROUTER_ATTEMPTS_PER_MODEL') ??
      String(DEFAULT_OPENROUTER_ATTEMPTS_PER_MODEL);
    const parsedValue = Number(rawValue);

    if (!Number.isFinite(parsedValue)) {
      return DEFAULT_OPENROUTER_ATTEMPTS_PER_MODEL;
    }

    return Math.min(3, Math.max(1, Math.trunc(parsedValue)));
  }

  getChatModel(): ChatOpenAI {
    const provider = this.resolveProvider();
    const model = this.resolveModel(provider);
    return this.getChatModelForModel(model);
  }

  getChatModelForModel(model: string): ChatOpenAI {
    const provider = this.resolveProvider();
    const cacheKey = `${provider}:${model}`;
    const cachedModel = this.chatModels.get(cacheKey);

    if (cachedModel) {
      return cachedModel;
    }

    const apiKey = this.resolveApiKey();

    if (!apiKey) {
      this.logger.warn(
        `LLM no configurado para provider=${provider}. Se requiere API key.`,
      );
      throw new Error(
        provider === 'openrouter'
          ? 'OPENROUTER_API_KEY is required to use LangChain with OpenRouter'
          : 'OPENAI_API_KEY is required to use LangChain',
      );
    }

    const temperature = this.resolveTemperature();
    const configuration = this.resolveClientConfiguration(provider);

    const chatModel = new ChatOpenAI({
      apiKey,
      model,
      temperature,
      maxRetries: 0,
      configuration,
    });

    this.chatModels.set(cacheKey, chatModel);

    this.logger.log(
      `LLM inicializado provider=${provider} model=${model} temperature=${temperature}`,
    );

    return chatModel;
  }

  private resolveProvider(): LlmProvider {
    const provider =
      this.configService.get<string>('LLM_PROVIDER')?.toLowerCase() ?? 'openai';

    return provider === 'openrouter' ? 'openrouter' : 'openai';
  }

  private resolveApiKey(): string {
    const provider = this.resolveProvider();

    if (provider === 'openrouter') {
      return this.configService.get<string>('OPENROUTER_API_KEY') ?? '';
    }

    return this.configService.get<string>('OPENAI_API_KEY') ?? '';
  }

  private resolveModel(provider: LlmProvider): string {
    if (provider === 'openrouter') {
      return (
        this.configService.get<string>('OPENROUTER_MODEL') ??
        DEFAULT_OPENROUTER_MODEL
      );
    }

    return (
      this.configService.get<string>('OPENAI_MODEL') ?? DEFAULT_OPENAI_MODEL
    );
  }

  private resolveTemperature(): number {
    const rawTemperature = this.configService.get<string>('OPENAI_TEMPERATURE');
    if (!rawTemperature) {
      return DEFAULT_OPENAI_TEMPERATURE;
    }

    const parsedTemperature = Number(rawTemperature);
    return Number.isFinite(parsedTemperature)
      ? parsedTemperature
      : DEFAULT_OPENAI_TEMPERATURE;
  }

  private resolveClientConfiguration(
    provider: LlmProvider,
  ): { baseURL: string; defaultHeaders?: Record<string, string> } | undefined {
    if (provider !== 'openrouter') {
      return undefined;
    }

    const baseURL =
      this.configService.get<string>('OPENROUTER_BASE_URL') ??
      DEFAULT_OPENROUTER_BASE_URL;

    const referer = this.configService.get<string>('OPENROUTER_HTTP_REFERER');
    const appTitle = this.configService.get<string>('OPENROUTER_APP_TITLE');

    const defaultHeaders: Record<string, string> = {};

    if (referer) {
      defaultHeaders['HTTP-Referer'] = referer;
    }

    if (appTitle) {
      defaultHeaders['X-Title'] = appTitle;
    }

    if (Object.keys(defaultHeaders).length === 0) {
      return { baseURL };
    }

    return {
      baseURL,
      defaultHeaders,
    };
  }
}
