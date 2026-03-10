const fs = require('fs');
const path = require('path');

const applyReplacements = (fileRelativePath, replacements) => {
    const fullPath = path.join(process.cwd(), fileRelativePath);
    if (!fs.existsSync(fullPath)) return;
    let data = fs.readFileSync(fullPath, 'utf8');
    let original = data;
    for (const [regex, replacement] of replacements) {
        data = data.replace(regex, replacement);
    }
    if (data !== original) {
        fs.writeFileSync(fullPath, data);
        console.log("Updated", fileRelativePath);
    }
};

applyReplacements('src/locales/fr.json', [
    [/"gdpr": "RGPD"/g, '"gdpr": "Privacy Act (APP)"']
]);

applyReplacements('src/locales/es.json', [
    [/gdpr/g, 'privacyAct'],
    [/GDPR/g, 'Privacy Act (APP)']
]);

applyReplacements('src/locales/de.json', [
    [/"gdpr": "DSGVO"/g, '"gdpr": "Privacy Act (APP)"']
]);

applyReplacements('src/components/support/WhatsAppChatWidget.tsx', [
    [/Cumple con GDPR\?/g, 'Cumple con Privacy Act (APP)?']
]);

applyReplacements('src/components/Footer.tsx', [
    [/{ name: t\('links.gdpr'\), href: `\/\$\{locale\}\/gdpr` \},/g, "{ name: t('links.privacy'), href: `/${locale}/privacy-act` },"]
]);

applyReplacements('src/app/sitemap.ts', [
    [/'\/gdpr',/g, "'/privacy-act',"]
]);

applyReplacements('src/components/widget/RealEstateWidget.tsx', [
    [/hide_gdpr_banner/g, 'hide_gdpr_banner'] // Just keeping context aware, calendly param won't change
]);
