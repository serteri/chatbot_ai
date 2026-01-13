const fs = require('fs');

const files = ['src/locales/en.json', 'src/locales/tr.json', 'src/locales/de.json', 'src/locales/fr.json', 'src/locales/es.json'];

files.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        JSON.parse(content);
        console.log(`${file}: OK`);
    } catch (e) {
        console.error(`${file}: INVALID - ${e.message}`);
        process.exit(1);
    }
});
