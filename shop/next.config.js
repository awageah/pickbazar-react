/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config');

/**
 * Kolshi S6 — shop runs in REST-only mode. The previous GraphQL webpack
 * branch (graphql-let / yaml-loader) was removed along with the graphql
 * framework folder. Next ≥13 already handles everything we need here.
 */
module.exports = {
  reactStrictMode: true,
  i18n,
  images: {
    domains: [
      'res.cloudinary.com',
      'lh3.googleusercontent.com',
      'localhost',
      '127.0.0.1',
      'i.pravatar.cc',
    ],
  },
  ...(process.env.APPLICATION_MODE === 'production' && {
    typescript: {
      ignoreBuildErrors: true,
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
  }),
};
