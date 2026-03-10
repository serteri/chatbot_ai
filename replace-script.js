const fs = require('fs');
const path = require('path');

const enFile = path.join('src', 'locales', 'en.json');
let enData = fs.readFileSync(enFile, 'utf8');

enData = enData.replace(/GDPR Compliance/g, 'Privacy Act (APP) Compliance');
enData = enData.replace(/"gdpr": "GDPR"/g, '"gdpr": "Privacy Act (APP)"');
enData = enData.replace(/Under GDPR, you have rights to access, rectification, erasure, and data portability\./g, 'Under the Privacy Act (APP), you have rights to access, correction, and data portability.');
enData = enData.replace(/transforming the way businesses interact with customers 24\/7/g, 'transforming how businesses manage NDIS compliance');
enData = enData.replace(/AI-powered chatbots\. Setup in minutes, 24\/7 support\./g, 'NDIS Shield Hub - Brisbane-based NDIS compliance platform.');
enData = enData.replace(/We use industry-standard security measures including SSL encryption, secure data centers, and regular security audits to protect your data\./g, 'We use industry-standard security measures including local data storage on Azure servers in Sydney, complying with Australian Privacy Principles (APP).');
fs.writeFileSync(enFile, enData);


const trFile = path.join('src', 'locales', 'tr.json');
let trData = fs.readFileSync(trFile, 'utf8');

trData = trData.replace(/"gdpr": "KVKK"/g, '"gdpr": "Privacy Act (APP)"');
trData = trData.replace(/"gdpr": "GDPR"/g, '"gdpr": "Privacy Act (APP)"');
trData = trData.replace(/GDPR Uyumluluğu/g, 'Privacy Act (APP) Uyumluluğu');
trData = trData.replace(/GDPR kapsamında erişim, düzeltme, silme ve veri taşınabilirliği haklarınız vardır\./g, 'Privacy Act (APP) kapsamında erişim, düzeltme ve veri taşınabilirliği haklarınız vardır.');
trData = trData.replace(/GDPR ve KVKK uyumludur/gi, 'Privacy Act (APP) uyumludur');
trData = trData.replace(/GDPR uyumluyuz/gi, 'Privacy Act (APP) uyumluyuz');
trData = trData.replace(/GDPR, KVKK/gi, 'Privacy Act (APP)');
trData = trData.replace(/kVKK verbis bildirimi/gi, 'Privacy Act bildirimi');
trData = trData.replace(/Avrupa \(Frankfurt\) veya ABD \(Virginia\) veri merkezlerinde saklanır/gi, "Sidney'deki (Avustralya) yerel Azure sunucularında saklanır");
fs.writeFileSync(trFile, trData);

const escFile = path.join('src', 'components', 'support', 'EnterpriseSupportCenter.tsx');
let escData = fs.readFileSync(escFile, 'utf8');

escData = escData.replace(/GDPR ve KVKK uyumludur/g, 'Privacy Act (APP) uyumludur');
escData = escData.replace(/GDPR ve KVKK uyumlu mu\?/g, 'Privacy Act (APP) uyumlu mu?');
escData = escData.replace(/GDPR and CCPA compliant/g, 'Privacy Act (APP) compliant');
escData = escData.replace(/Is it GDPR and CCPA compliant\?/g, 'Is it Privacy Act (APP) compliant?');
escData = escData.replace(/Avrupa ve ABD'deki/g, "Sidney'deki (Avustralya) yerel");
escData = escData.replace(/EU and US data centers/g, 'local Azure servers in Sydney');
fs.writeFileSync(escFile, escData);

const waFile = path.join('src', 'components', 'support', 'WhatsAppChatWidget.tsx');
let waData = fs.readFileSync(waFile, 'utf8');
waData = waData.replace(/GDPR, KVKK, CCPA, HIPAA \(Enterprise\)/g, 'Privacy Act (APP)');
waData = waData.replace(/GDPR, CCPA, HIPAA \(Enterprise\)/g, 'Privacy Act (APP)');
waData = waData.replace(/GDPR ve KVKK uyumlu mu\?/g, 'Privacy Act (APP) uyumlu mu?');
waData = waData.replace(/Is it GDPR and CCPA compliant\?/g, 'Is it Privacy Act (APP) compliant?');
waData = waData.replace(/Avrupa \(Frankfurt\) veya ABD \(Virginia\) veri merkezlerinde/g, "Sidney'deki (Avustralya) yerel Azure sunucularında");
waData = waData.replace(/Europe \(Frankfurt\) or USA \(Virginia\) data centers/g, 'local Azure servers in Sydney, Australia');
waData = waData.replace(/Europe data storage option/g, 'Local Australian data storage');
waData = waData.replace(/Avrupa'da veri depolama seçeneği/g, "Avustralya'da yerel veri depolama");
waData = waData.replace(/KVKK verbis bildirimi icin gerekli dokumanlari sagliyoruz/g, 'APP uyumluluğu için gerekli dokümanları sağlıyoruz');
fs.writeFileSync(waFile, waData);
