# Refactorer

Basic code refactors with the help of ChatGPT

To use:

1. Create a `OPENAI_KEY` in your `.env` file
2. Create a config file, called `refactorer.js` in your project root.

The content of the file should look something like this:

```js
module.exports = {
  globPatterns: ['./components/**/*.tsx', './pages/**/*.tsx', './lib/**/*.ts'],
  instructions: [
    "Remove `import useTranslation from 'next-translate/useTranslation';` if it exists",
    'Remove `const { t } = useTranslation();` if it exists',
    'Add `t: (key: string) => string` to the props of the component',
    'Add `t` to the destructured props of the component',
  ],
};
```

then just run:

```bash
npx refactorer [command]
```

`refactor`

Starts the refactoring
