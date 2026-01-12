const fs = require('fs');
const en = JSON.parse(fs.readFileSync('src/locales/en.json', 'utf8'));
const de = JSON.parse(fs.readFileSync('src/locales/de.json', 'utf8'));

function findMissingKeys(obj1, obj2, path) {
    path = path || '';
    const missing = [];
    for (const key of Object.keys(obj1)) {
        const currentPath = path ? path + '.' + key : key;
        if (!(key in obj2)) {
            missing.push(currentPath);
        } else if (typeof obj1[key] === 'object' && obj1[key] !== null && !Array.isArray(obj1[key])) {
            if (typeof obj2[key] === 'object' && obj2[key] !== null) {
                missing.push(...findMissingKeys(obj1[key], obj2[key], currentPath));
            } else {
                missing.push(currentPath);
            }
        }
    }
    return missing;
}

const missingInDe = findMissingKeys(en, de);
console.log('Missing in DE:');
missingInDe.forEach(k => console.log('  ' + k));
console.log('Total missing:', missingInDe.length);
