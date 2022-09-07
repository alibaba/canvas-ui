module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/recommended',
  ],
  rules: {
    'react-hooks/rules-of-hooks': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/display-name': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'quotes': ['error', 'single', { 'allowTemplateLiterals': true }],
    'semi': ['error', 'never'],
    'react/prop-types': 'off',
    'eol-last': ['error', 'always'],
    'eqeqeq': ['error'],
    '@typescript-eslint/no-this-alias': [
      'error',
      {
        'allowDestructuring': true, // Allow `const { props, state } = this`; false by default
        'allowedNames': ['self', 'node'] // Allow `const self = this`; `[]` by default
      }
    ],
    '@typescript-eslint/no-empty-function': [
      'error',
      {
        'allow': [
          'private-constructors',
          'protected-constructors',
          'methods',
          'asyncMethods',
          'arrowFunctions'
        ]
      }
    ],
    '@typescript-eslint/no-unused-vars': ["error", { "argsIgnorePattern": "^_" }],
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
}
