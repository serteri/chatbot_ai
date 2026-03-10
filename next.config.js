const createNextIntlPlugin = require('next-intl/plugin');

// Path to i18n config
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig = {
    // Prevent duplicate content from /page vs /page/ — always use no trailing slash.
    trailingSlash: false,

    experimental: {
        serverActions: {
            allowedOrigins: [
                'localhost:3000',
                '*.vercel.app',
                'ndisshield.com.au',
                'www.ndisshield.com.au',
            ]
        }
    },

    typescript: {
        ignoreBuildErrors: true,
    },

    async redirects() {
        return [
            {
                source: '/en/gdpr',
                destination: '/en/privacy-act',
                permanent: true,
            },
            {
                source: '/tr/gdpr',
                destination: '/tr/privacy-act',
                permanent: true,
            }
        ];
    },
}

module.exports = withNextIntl(nextConfig)