module.exports = {
  root: true,
  extends: ['plugin:prettier/recommended'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        parser: 'flow',
        endOfLine: 'lf',
        arrowParens: 'avoid',
        bracketSpacing: true,
      },
    ],
  },
};
