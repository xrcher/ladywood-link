// =================================================
// DASHBOARD MAP
// =================================================

const map = L.map("map");

L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution: "&copy; OpenStreetMap contributors"
    }
).addTo(map);

// =================================================
// MARKER ICONS
// =================================================

const wasteIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

// =================================================
// RECYCLING POINTS
// =================================================

const markers = [];

markers.push(
    L.marker([52.49348113607801, -1.9139657866556745])
        .addTo(map)
        .bindPopup("Enviro City")
);

markers.push(
    L.marker([52.484936097057066, -1.9260249978629895])
        .addTo(map)
        .bindPopup("Roba Metals Ltd")
);

markers.push(
    L.marker([52.47252062104807, -1.9240508922181054])
        .addTo(map)
        .bindPopup("Green Channel Recycling Limited")
);

// =================================================
// LOAD WASTE REPORT MARKERS
// =================================================

fetch("/api/waste-map-reports")
    .then(response => response.json())
    .then(data => {
        if (!data.success) return;

        data.reports.forEach(report => {
            if (!report.latitude || !report.longitude) return;

            L.marker(
                [Number(report.latitude), Number(report.longitude)],
                { icon: wasteIcon }
            )
            .addTo(map)
            .bindPopup(`
                <strong>${report.issue_type}</strong><br>
                ${report.location}<br>
                ${report.details}
            `);
        });
    })
    .catch(error => {
        console.error("Failed to load waste markers:", error);
    });

// =================================================
// CLICK MAP TO REPORT WASTE
// =================================================

map.on("click", (event) => {
    const lat = event.latlng.lat;
    const lng = event.latlng.lng;

    const reportUrl =
        `/waste-report?lat=${lat}&lng=${lng}`;

    L.popup()
        .setLatLng(event.latlng)
        .setContent(`
            <strong>Report waste here?</strong><br>
            <a href="${reportUrl}">Create waste report</a>
        `)
        .openOn(map);
});

// =================================================
// FIT MAP TO RECYCLING POINTS
// =================================================

const group = new L.featureGroup(markers);
map.fitBounds(group.getBounds().pad(0.2));