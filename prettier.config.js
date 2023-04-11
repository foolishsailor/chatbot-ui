module.exports = {
  trailingComma: 'all',
  singleQuote: true,
  plugins: [
    'prettier-plugin-tailwindcss',
    '@trivago/prettier-plugin-sort-imports',
  ],
  importOrder: [
    'react', // React
    '^react-.*$', // React-related imports
    '^next', // Next-related imports
    '^next-.*$', // Next-related imports
    '^next/.*$', // Next-related imports
    '^@reduxjs/.*$', // Redux
    '^.*/hooks/.*$', // Hooks
    '^.*/services/.*$', // Services
    '^.*/utils/.*$', // Utils
    '^.*/store', // Store
    '^.*/store/.*$', // Store
    '^.*/types/.*$', // Types
    '^.*/pages/.*$', // Components
    '^.*/components/.*$', // Components
    '^[./]', // Other imports
    '.*', // Any uncaught imports
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};
