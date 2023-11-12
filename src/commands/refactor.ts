import CliProgress from 'cli-progress';
import fs from 'fs';
import * as glob from 'glob';
import * as path from 'path';
import { Configuration } from '../lib/types';
import { getTextInput } from '../lib/utils';

const bar = new CliProgress.SingleBar({
  format:
    'Refactoring | {bar} | {percentage}% || {value}/{total} Files, {skipped} Skipped',
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
  hideCursor: true,
});

function allProgress(proms, progress_cb) {
  let d = 0;
  progress_cb(0);
  for (const p of proms) {
    p.then(() => {
      d++;
      progress_cb((d * 100) / proms.length);
    });
  }
  return Promise.all(proms);
}

export const refactorCode = async (config: Configuration) => {
  const confirm = await getTextInput(
    "Please make sure you've committed your code before continuing. Type 'yes' to continue."
  );

  if (confirm !== 'yes') {
    process.exit(0);
  }

  const cwd = process.cwd();

  const allFiles: { content: string; path: string }[] = [];

  for (const globPattern of config.globPatterns) {
    // Use the glob module to get an array of file paths that match the glob pattern
    const files = glob.sync(path.resolve(cwd, globPattern));

    for (const file of files) {
      if (!fs.statSync(file).isFile()) {
        continue;
      }

      const fileContent = fs.readFileSync(file, 'utf8');

      if (fileContent.length === 0) {
        continue;
      }

      allFiles.push({ content: fileContent, path: file });
    }
  }

  const filteredFiles = allFiles.filter(({ content }) => {
    for (const refactorReason of config.refactorReasons) {
      if (content.includes(refactorReason)) {
        return true;
      }
    }

    return false;
  });

  bar.start(filteredFiles.length, 0, {
    skipped: allFiles.length - filteredFiles.length,
  });

  const promises = filteredFiles.map(({ content }) => {
    return config.openai.chat.completions.create({
      model: 'gpt-3.5-turbo-1106',
      messages: [
        {
          role: 'system',
          content: `You are an expert developer. Your job is to refactor code based on the instructions provided by you. You only make the changes that are specified in the instructions. You leave the rest of the code as it is. The code can be found between the two \`\`\` code blocks. You only return  the code, not just the changes. If none of the instructions are relevant to the code, you return the code as it is.
              
          Code: 
          \`\`\`
          ${content}
          \`\`\`
        
          Instructions:
          ${config.instructions.join('\n')}
          `,
        },
      ],
    });
  });

  const resolved = await allProgress(promises, (progress) => bar.increment());

  for (const [index, res] of resolved.entries()) {
    const code = res.choices[0].message.content;

    let split = code.split('\n');

    if (split[0].indexOf('```') === 0) {
      split.shift();
    }

    if (split[split.length - 1].indexOf('```') === 0) {
      split.pop();
    }

    const result = split.join('\n');

    // Write the refactored content back to the file
    fs.writeFileSync(filteredFiles[index].path, result, 'utf8');
  }

  bar.stop();
};
