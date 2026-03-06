const createNextIntlPlugin = require('next-intl/plugin');

// Path to i18n config
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig = {
    experimental: {
        serverActions: {
            allowedOrigins: [
                'localhost:3000',
                '*.vercel.app',
                'pylonchat.com',
                'www.pylonchat.com',
            ]
        }
    },

    typescript: {
        ignoreBuildErrors: true,
    },
}

module.exports = withNextIntl(nextConfig)