import { Command } from 'commander';
import OpenAI from 'openai';
import { refactorCode } from './commands/refactor';
import { CommandType } from './lib/types';
import { loadConfig } from './lib/utils';

const program = new Command();

require('dotenv').config();

program
  .name('refactorer')
  .description('CLI to help you do more advanced refactoring, using OpenAI')
  .version('0.3.0');

const commands: CommandType[] = [
  {
    name: 'refactor',
    description:
      'Given glob patterns and a list of things to refactor, it will apply the changes to the files.',
    action: refactorCode,
  },
];

for (const command of commands) {
  program
    .command(command.name)
    .description(command.description)
    .action(async () => {
      const config = await loadConfig();
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_KEY,
      });

      if (!process.env.OPENAI_KEY) {
        console.error(
          'Please provide an OpenAI API key in your .env file, called OPENAI_KEY.'
        );
        process.exit(1);
      }

      command.action({ ...config, openai });
    });
}

program.parse(process.argv);
