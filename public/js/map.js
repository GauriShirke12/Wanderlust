/* Map functionality temporarily disabled.
(() => {
    const MAP_CONTAINER_ID = 'map';
    const CONFIG_ELEMENT_ID = 'map-config';
    const SCRIPT_DATA_ATTRIBUTE = 'data-listing-map';

    const getMapElement = () => document.getElementById(MAP_CONTAINER_ID);

        const renderMessage = (message) => {
        const mapElement = getMapElement();
        if (!mapElement) {
            return;
        }
        mapElement.innerHTML = '';
        const messageNode = document.createElement('p');
        messageNode.textContent = message;
        messageNode.className = 'map-status';
        mapElement.appendChild(messageNode);
    };

        const renderEmbedFallback = (query, apiKey) => {
            const mapElement = getMapElement();
            if (!mapElement || !query || !apiKey) {
                return false;
            }

            const iframe = document.createElement('iframe');
            iframe.width = '100%';
            iframe.height = '100%';
            iframe.style.border = '0';
            iframe.loading = 'lazy';
            iframe.allowFullscreen = true;
            iframe.referrerPolicy = 'no-referrer-when-downgrade';
            iframe.src = `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(query)}`;

            mapElement.innerHTML = '';
            mapElement.appendChild(iframe);
            return true;
        };

    const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (char) => {
        const entities = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
        };
        return entities[char] || char;
    });

    const readConfig = () => {
        try {
            const configElement = document.getElementById(CONFIG_ELEMENT_ID);
            if (!configElement) {
                return {};
            }
            return JSON.parse(configElement.textContent || '{}');
        } catch (error) {
            console.error('Failed to parse map configuration:', error);
            return {};
        }
    };

    const mapElement = getMapElement();
    if (!mapElement) {
        return;
    }

    const config = readConfig();
    window.__listingMapConfig = config;

    const listing = config.listing || {};
    const query = [listing.location, listing.country]
        .map((part) => (typeof part === 'string' ? part.trim() : ''))
        .filter(Boolean)
        .join(', ');

    window.__listingMapQuery = query;

    if (!config.apiKey) {
        renderMessage('Map unavailable. Missing API key.');
        return;
    }

    if (!query) {
        renderMessage('Map unavailable. Listing has no location details.');
        return;
    }

    window.initListingMap = () => {
        const targetElement = getMapElement();
        if (!targetElement) {
            return;
        }

        const activeConfig = window.__listingMapConfig || {};
        const activeQuery = window.__listingMapQuery || '';

        if (!activeQuery) {
            renderMessage('Map unavailable. Listing has no location details.');
            return;
        }

        if (!window.google || !window.google.maps) {
            renderMessage('Map unavailable right now. Please try again later.');
            return;
        }

        const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ address: activeQuery }, (results, status) => {
                if (status !== 'OK' || !Array.isArray(results) || !results.length) {
                    const normalizedStatus = typeof status === 'string' ? status.toUpperCase() : 'UNKNOWN_ERROR';
                    console.warn('Geocode failed:', normalizedStatus, results);

                    if (normalizedStatus === 'REQUEST_DENIED') {
                        const success = renderEmbedFallback(activeQuery, activeConfig.apiKey);
                        if (success) {
                            return;
                        }
                        renderMessage('Map request denied. Confirm billing is enabled and the API key has Maps Embed or JavaScript access.');
                        return;
                    }

                    if (normalizedStatus === 'ZERO_RESULTS') {
                        renderMessage('Map unavailable. Location could not be found.');
                        return;
                    }

                    if (normalizedStatus === 'OVER_QUERY_LIMIT') {
                        renderMessage('Map temporarily unavailable due to usage limits. Please try again later.');
                        return;
                    }

                    const fallbackShown = renderEmbedFallback(activeQuery, activeConfig.apiKey);
                    if (!fallbackShown) {
                        renderMessage('Map unavailable right now. Please try again later.');
                    }
                return;
            }

            const bestResult = results[0];
            const geometry = bestResult.geometry || {};
            const location = geometry.location;

                    if (!location) {
                        renderMessage('Map unavailable. Location details are incomplete.');
                return;
            }

            targetElement.innerHTML = '';

            const map = new window.google.maps.Map(targetElement, {
                center: location,
                zoom: 11,
                mapTypeControl: false,
                streetViewControl: false,
            });

            const markerTitle = activeConfig.listing && activeConfig.listing.title ? String(activeConfig.listing.title) : activeQuery;
            const marker = new window.google.maps.Marker({
                map,
                position: location,
                title: markerTitle,
            });

            const infoWindow = new window.google.maps.InfoWindow({
                content: `<div class="map-info-window"><strong>${escapeHtml(markerTitle)}</strong><div>${escapeHtml(bestResult.formatted_address || activeQuery)}</div></div>`,
            });

            infoWindow.open({ map, anchor: marker });
            marker.addListener('click', () => infoWindow.open({ map, anchor: marker }));
        });
    };

    if (window.google && window.google.maps) {
        window.initListingMap();
        return;
    }

    const existingScript = document.querySelector(`script[${SCRIPT_DATA_ATTRIBUTE}]`);
    if (existingScript) {
        existingScript.addEventListener('load', () => window.initListingMap(), { once: true });
        existingScript.addEventListener('error', () => renderMessage('Map unavailable right now. Please try again later.'), { once: true });
        return;
    }

    const loader = document.createElement('script');
    loader.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(config.apiKey)}&callback=initListingMap`;
    loader.async = true;
    loader.defer = true;
    loader.setAttribute(SCRIPT_DATA_ATTRIBUTE, 'loader');
        loader.onerror = () => {
            const fallbackShowing = renderEmbedFallback(window.__listingMapQuery || '', (window.__listingMapConfig || {}).apiKey || '');
            if (!fallbackShowing) {
                renderMessage('Map unavailable right now. Please try again later.');
            }
        };
    document.head.appendChild(loader);
})();
*/