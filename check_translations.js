const fs = require('fs');
try {
    const tr = JSON.parse(fs.readFileSync('./src/locales/tr.json', 'utf8'));
    console.log('tr.json loaded successfully');
    if (tr.widget && tr.widget.colors) {
        console.log('tr.widget.colors exists:', tr.widget.colors);
    } else {
        console.error('tr.widget.colors matches NOTHING');
        console.log('tr keys:', Object.keys(tr));
        if (tr.widget) console.log('tr.widget keys:', Object.keys(tr.widget));
    }

    const en = JSON.parse(fs.readFileSync('./src/locales/en.json', 'utf8'));
    console.log('en.json loaded successfully');
    if (en.widget && en.widget.colors) {
        console.log('en.widget.colors exists:', en.widget.colors);
    } else {
        console.error('en.widget.colors matches NOTHING');
    }

    // Check ChatWidget keys
    if (en.ChatWidget && en.ChatWidget.online) {
        console.log('en.ChatWidget.online exists:', en.ChatWidget.online);
    } else {
        console.error('en.ChatWidget.online MISSING');
    }

    if (tr.ChatWidget && tr.ChatWidget.online) {
        console.log('tr.ChatWidget.online exists:', tr.ChatWidget.online);
    } else {
        console.error('tr.ChatWidget.online MISSING');
    }


} catch (e) {
    console.error('Error loading JSON:', e.message);
}
