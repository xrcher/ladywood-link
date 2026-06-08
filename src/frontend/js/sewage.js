document.addEventListener('DOMContentLoaded', async () => {
    const activeSpillsEl = document.getElementById('active-spills-count');
    const totalHoursEl = document.getElementById('total-spill-hours');
    const totalOutletsEl = document.getElementById('total-outlets-count');
    const map = L.map('map').setView([52.4796, -1.9224], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const markerLayer = L.layerGroup().addTo(map);
    let sewageData = [];

    function renderMarkers(filterType) {
        markerLayer.clearLayers();

        sewageData.forEach(locationItem => {
            const lat = locationItem.latitude || locationItem.lat;
            const lon = locationItem.longitude || locationItem.lon;

            if (lat && lon) {
                const isActive = locationItem.is_active_alert === true ||
                    locationItem.is_active_alert === 1 ||
                    locationItem.status === 'active';

                if (filterType === 'spills' && !isActive) {
                    return;
                }

                const statusLabel = isActive ? '⚠️ ACTIVE SPILL' : '✅ Stable';
                const assetName = locationItem.asset_name || locationItem.location_name || 'EDM Station';

                L.marker([lat, lon])
                    .bindPopup(`
                        <div style="font-family: Arial, sans-serif; line-height: 1.4;">
                            <strong style="font-size:1.1em; color:#2c3e50;">${assetName}</strong><br/>
                            <span style="color:${isActive ? '#e74c3c' : '#2ecc71'}; font-weight:bold;">${statusLabel}</span><br/>
                        </div>
                    `)
                    .addTo(markerLayer);
            }
        });
    }

    try {
        const response = await fetch('/api/sewage/alerts');
        if (!response.ok) throw new Error(`Server status failure: ${response.status}`);

        sewageData = await response.json();

        const totalOutlets = sewageData.length;
        const activeSpills = sewageData.filter(item =>
            item.is_active_alert === true || item.is_active_alert === 1 || item.status === 'active'
        ).length;
        const totalHours = sewageData.reduce((sum, item) => sum + (Number(item.duration_hours) || 0), 0);

        if (activeSpillsEl) activeSpillsEl.textContent = activeSpills;
        if (totalHoursEl) totalHoursEl.textContent = `${totalHours.toFixed(2)} hrs`;
        if (totalOutletsEl) totalOutletsEl.textContent = totalOutlets;

        renderMarkers('all');

        // Toggle
        const btnAll = document.getElementById('toggle-all');
        const btnSpills = document.getElementById('toggle-spills');

        if (btnAll && btnSpills) {
            btnAll.addEventListener('click', () => {
                btnAll.classList.add('active');
                btnSpills.classList.remove('active');
                renderMarkers('all');
            });

            btnSpills.addEventListener('click', () => {
                btnSpills.classList.add('active');
                btnAll.classList.remove('active');
                renderMarkers('spills');
            });
        }

    } catch (error) {
        console.error('Error:', error);
        if (activeSpillsEl) activeSpillsEl.textContent = 'Err';
        if (totalHoursEl) totalHoursEl.textContent = 'Err';
        if (totalOutletsEl) totalOutletsEl.textContent = 'Err';
    }
});