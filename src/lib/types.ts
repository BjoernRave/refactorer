import OpenAI from 'openai';

export interface Configuration {
  globPatterns: string[];
  instructions: string[];
  skipReasons: string[];
  openai: OpenAI;
}

export interface CommandType {
  name: string;
  description: string;
  action: (config: Configuration) => Promise<void>;
}
