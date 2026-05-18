import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';

const DEFAULT_OPENAI_MODEL = 'gpt-4.1-mini';
const DEFAULT_OPENAI_TEMPERATURE = 0;

@Injectable()
export class LangchainService {
  private chatModel: ChatOpenAI | null = null;

  constructor(private readonly configService: ConfigService) {}

  getChatModel(): ChatOpenAI {
    if (this.chatModel) {
      return this.chatModel;
    }

    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required to use LangChain');
    }

    const model =
      this.configService.get<string>('OPENAI_MODEL') ?? DEFAULT_OPENAI_MODEL;
    const temperature = this.resolveTemperature();

    this.chatModel = new ChatOpenAI({
      apiKey,
      model,
      temperature,
    });

    return this.chatModel;
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
}
