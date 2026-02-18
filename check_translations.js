const fs = require('fs');
const files = ['en', 'tr', 'de', 'fr', 'es'];

files.forEach(lang => {
    try {
        const path = `./src/locales/${lang}.json`;
        if (!fs.existsSync(path)) {
            console.error(`${lang}.json NOT FOUND`);
            return;
        }
        const data = JSON.parse(fs.readFileSync(path, 'utf8'));
        console.log(`${lang}.json loaded successfully`);

        // Check widget.realestate
        if (data.widget && data.widget.realestate) {
            console.log(`${lang}.widget.realestate exists`);
        } else {
            console.error(`${lang}.widget.realestate MISSING`);
        }

        // Check widget.colors (to see if merge worked/didn't overwrite)
        if (data.widget && data.widget.colors) {
            console.log(`${lang}.widget.colors exists`);
        } else {
            console.error(`${lang}.widget.colors MISSING`);
        }

        // Check ChatWidget
        if (data.ChatWidget && data.ChatWidget.online) {
            console.log(`${lang}.ChatWidget.online exists`);
        } else {
            console.error(`${lang}.ChatWidget.online MISSING`);
        }

    } catch (e) {
        console.error(`Error loading ${lang}.json:`, e.message);
    }
});
