import fs from 'fs';
import path from 'path';
import prompts from 'prompts';
export const loadConfig = () => {
  const filePath = path.join(process.cwd(), 'refactorer.js');

  if (!fs.existsSync(filePath)) {
    console.error(
      `Config file does not exist: ${filePath}`,
      'Please create a refactorer.js file in your root'
    );
    process.exit(1);
  }

  try {
    const config = require(filePath);
    // Validate config if needed
    return config;
  } catch (error) {
    console.error('Error while loading config:', error);
    process.exit(1);
  }
};

export const getTextInput = async (prompt: string) => {
  const input = await prompts({
    name: 'value',
    type: 'text',
    message: prompt,
    onState: (state) => {
      if (state.aborted) {
        process.nextTick(() => {
          process.exit(0);
        });
      }
    },
  });

  return input.value as string;
};
