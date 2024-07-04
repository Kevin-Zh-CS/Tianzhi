module.exports = {
  extends: [require.resolve('@umijs/fabric/dist/eslint')],
  globals: {
    ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION: true,
    page: true,
    PRODUCTION_ENV: true,
  },
  rules: {
    'prefer-promise-reject-errors': 0,
    'no-underscore-dangle': 0,
    '@typescript-eslint/camelcase': 0,
    'font-family-no-missing-generic-family-keyword': 0,
    'import/no-unresolved': 0,
    'jsx-a11y/media-has-caption': 0,
    'no-nested-ternary': 0,
    'react/no-unescaped-entities': 0,
  },
};
