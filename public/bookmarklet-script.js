/* eslint-disable */
(function () {
    // 1. Setup UI
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;top:20px;right:20px;z-index:99999;padding:16px;background:#3b82f6;color:white;border-radius:8px;font-family:sans-serif;box-shadow:0 4px 12px rgba(0,0,0,0.15);display:flex;align-items:center;gap:10px;font-size:14px;';
    toast.innerHTML = '<span>🏠 Processing property...</span>';
    document.body.appendChild(toast);

    function showSuccess(msg) {
        toast.style.background = '#10b981';
        toast.innerHTML = '<span>✅ ' + msg + '</span>';
        setTimeout(() => toast.remove(), 3000);
    }

    function showError(msg) {
        toast.style.background = '#ef4444';
        toast.innerHTML = '<span>❌ ' + msg + '</span>';
        setTimeout(() => toast.remove(), 5000);
    }

    try {
        // 2. Constants
        const script = document.currentScript; // This script tag
        if (!script) throw new Error('Script context lost');

        const chatbotId = script.dataset.chatbotId;
        const apiEndpoint = script.dataset.apiEndpoint;

        if (!chatbotId || !apiEndpoint) {
            throw new Error('Configuration missing');
        }

        // 3. Helper Functions
        const getText = (selector) => {
            const el = document.querySelector(selector);
            return el ? el.innerText.trim() : '';
        };

        const getAttr = (selector, attr) => {
            const el = document.querySelector(selector);
            return el ? el.getAttribute(attr) : '';
        };

        const parsePrice = (text) => {
            if (!text) return 0;
            const cleaned = text.replace(/[^0-9.]/g, '');
            const val = parseFloat(cleaned);
            if (val < 100 && text.toLowerCase().includes('m')) return val * 1000000; // 1.2M -> 1200000
            if (val < 1000) return val * 1000; // 850k -> 850000 (roughly)
            return val;
        };

        const extractNumber = (text) => {
            const match = text && text.match(/(\\d+)/);
            return match ? parseInt(match[0]) : 0;
        };

        // 4. Scrape Logic
        const url = window.location.href;
        let data = {
            sourceUrl: url,
            listingType: url.includes('rent') ? 'rent' : 'sale'
        };

        if (url.includes('realestate.com.au')) {
            data.title = getText('h1') || getText('.property-address');
            data.price = parsePrice(getText('[data-testid="listing-details__summary-price"]') || getText('.property-price'));
            data.address = getText('[data-testid="listing-details__button-copy-address"]') || data.title;
            data.description = getText('[data-testid="listing-details__description"]') || getText('.property-description');

            // Features
            const bedsText = getText('[aria-label*="bedrooms"]') || getText('.bedrooms');
            data.bedrooms = extractNumber(bedsText);

            const bathsText = getText('[aria-label*="bathrooms"]') || getText('.bathrooms');
            data.bathrooms = extractNumber(bathsText);

            // Images
            data.images = Array.from(document.querySelectorAll('img[src*="bucket-api"]'))
                .map(img => img.src)
                .filter(src => !src.includes('agent') && !src.includes('logo'))
                .slice(0, 5);

            // Suburb/City
            // Try to extract from URL: property-house-qld-albion-123
            const urlParts = url.split('-');
            const stateIndex = urlParts.findIndex(p => ['qld', 'nsw', 'vic', 'wa', 'sa', 'tas', 'act', 'nt'].includes(p));
            if (stateIndex !== -1) {
                data.city = urlParts[stateIndex].toUpperCase();
                data.suburb = urlParts[stateIndex + 1];
                if (data.suburb) data.suburb = data.suburb.charAt(0).toUpperCase() + data.suburb.slice(1);
            }
            if (!data.city) data.city = 'VIC'; // Default
            if (!data.propertyType) data.propertyType = url.includes('apartment') ? 'apartment' : 'house';

        } else if (url.includes('domain.com.au')) {
            data.title = getText('h1');
            data.price = parsePrice(getText('[data-testid="listing-details__summary-price"]'));
            data.address = getText('h1'); // Domain often puts address in H1
            data.description = getText('[data-testid="listing-details__description"]');

            data.bedrooms = extractNumber(getText('[data-testid="property-features-beds"]'));
            data.bathrooms = extractNumber(getText('[data-testid="property-features-baths"]'));

            data.images = Array.from(document.querySelectorAll('[data-testid="gallery-image"]'))
                .map(img => img.src)
                .slice(0, 5);

            data.city = 'VIC'; // Fallback
            data.suburb = 'Unknown';
            data.propertyType = 'house';
        } else {
            throw new Error('Site not supported. Use realestate.com.au or domain.com.au');
        }

        // 5. Send to API
        fetch(apiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chatbotId, ...data })
        })
            .then(res => res.json())
            .then(resData => {
                if (resData.success) {
                    showSuccess('Property saved successfully!');
                } else {
                    throw new Error(resData.error || 'Unknown error');
                }
            })
            .catch(err => {
                console.error(err);
                showError(err.message);
            });

    } catch (e) {
        console.error(e);
        showError(e.message);
    }
})();
