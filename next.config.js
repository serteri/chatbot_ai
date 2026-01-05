const createNextIntlPlugin = require('next-intl/plugin');

// Path to i18n config
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig = {
    experimental: {
        serverActions: {
            allowedOrigins: ['localhost:3000']
        }
    },
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
    typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        // !! WARN !!
        ignoreBuildErrors: true,
    },
}

module.exports = withNextIntl(nextConfig)