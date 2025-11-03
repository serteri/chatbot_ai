const createNextIntlPlugin = require('next-intl/plugin');

// ← PATH EKLE
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig = {}

module.exports = withNextIntl(nextConfig)