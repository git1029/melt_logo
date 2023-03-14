/* eslint-env node */
module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['react'],
  rules: {
    indent: ['error', 2, { SwitchCase: 1 }],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'never'],
    eqeqeq: 'error',
    'no-trailing-spaces': 'error',
    'object-curly-spacing': ['error', 'always'],
    'arrow-spacing': ['error', { before: true, after: true }],
    'no-console': 0,
    'react/prop-types': 0,
    'react/react-in-jsx-scope': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'no-unused-vars': 'warn',
    'react/no-unknown-property': [
      'error',
      {
        ignore: [
          'args',
          'vertexShader',
          'fragmentShader',
          'position',
          'geometry',
          'uniforms',
          'side',
          'wireframe',
          'attach',
          'count',
          'itemSize',
          'array',
          'dynamic',
          'transparent',
          'depthWrite',
          'precision',
          'alphaTest',
          'toneMapped',
        ],
      },
    ],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
}
