import fs from 'fs';
import * as glob from 'glob';
import { Configuration } from '../lib/types';

export const refactorCode = async (config: Configuration) => {
  for (const globPattern of config.globPatterns) {
    // Use the glob module to get an array of file paths that match the glob pattern
    const files = glob.sync(globPattern);

    for (const file of files) {
      // Read the file
      const fileContent = fs.readFileSync(file, 'utf8');

      const response = await config.openai.chat.completions.create({
        model: 'gpt-3.5-turbo-1106',
        messages: [
          {
            role: 'system',
            content: `You are an expert developer. Your job is to refactor code based on the instructions provided by you. You only make the changes that are specified in the instructions. You leave the rest of the code as it is. The code can be found between the two \`\`\` code blocks. You only return  the code, not just the changes. You don't return any markdown surrounding the code, like \`\`\`jsx, you only return the code
                
            Code: 
            \`\`\`
            ${fileContent}
            \`\`\`
          
            Instructions:
            ${config.instructions.join('\n')}
            `,
          },
        ],
      });

      const code = response.choices[0].message.content;

      const split = code.split('\n');

      if (split[0].indexOf('```') === 0) {
        split.shift();
      }

      if (split[split.length - 1].indexOf('```') === 0) {
        split.pop();
      }

      // Write the refactored content back to the file
      fs.writeFileSync(file, code, 'utf8');
    }
  }
};
