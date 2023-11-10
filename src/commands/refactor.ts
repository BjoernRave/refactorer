import fs from 'fs';
import * as glob from 'glob';
import { Configuration } from '../lib/types';
import { getTextInput } from '../lib/utils';

export const refactorCode = async (config: Configuration) => {
  const confirm = await getTextInput(
    "Please make sure you've committed your code before continuing. Type 'yes' to continue."
  );

  if (confirm !== 'yes') {
    process.exit(0);
  }

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
            content: `You are an expert developer. Your job is to refactor code based on the instructions provided by you. You only make the changes that are specified in the instructions. You leave the rest of the code as it is. The code can be found between the two \`\`\` code blocks. You only return  the code, not just the changes. If none of the instructions are relevant to the code, you return the code as it is. There is also a list of reasons,called Stop Reasons, to not refactor the given file at all. If the file matches any of the reasons, you return the code as it is.
            
            Stop Reasons: 
            ${config.skipReasons.join('\n')}
                
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

      let split = code.split('\n');

      if (split[0].indexOf('```') === 0) {
        split.shift();
      }

      if (split[split.length - 1].indexOf('```') === 0) {
        split.pop();
      }

      // Write the refactored content back to the file
      fs.writeFileSync(file, split.join('\n'), 'utf8');
    }
  }
};
