// =================================================
// WASTE REPORT MAP
// =================================================

const wasteMap = L.map("map").setView([52.4756, -1.9348], 14);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
}).addTo(wasteMap);

let selectedMarker = null;

wasteMap.on("click", (event) => {
    const { lat, lng } = event.latlng;

    document.getElementById("waste-latitude").value = lat;
    document.getElementById("waste-longitude").value = lng;

    document.getElementById("waste-location").value =
        `Selected map location: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;

    if (selectedMarker) {
        selectedMarker.setLatLng(event.latlng);
    } else {
        selectedMarker = L.marker(event.latlng).addTo(wasteMap);
    }

    selectedMarker.bindPopup("Waste issue location").openPopup();
});

// =================================================
// WASTE REPORT FORM
// =================================================

const wasteForm = document.getElementById("wasteReportForm");
const wasteHistory = document.getElementById("waste-history");

function renderWasteHistory(reports) {
    if (!wasteHistory) return;

    if (!reports || reports.length === 0) {
        wasteHistory.innerHTML = `<p class="empty-history">No waste reports submitted yet.</p>`;
        return;
    }

    wasteHistory.innerHTML = "";

    reports.forEach(report => {
        const historyItem = document.createElement("div");
        historyItem.classList.add("history-item");

        historyItem.innerHTML = `
            <p class="history-location">${report.issue_type}</p>
            <p>${report.location}</p>
            <p>${report.details}</p>
            <p class="history-points">+${report.points_earned} Green Points earned</p>
            <p class="history-date">${new Date(report.created_at).toLocaleDateString()}</p>
        `;

        wasteHistory.appendChild(historyItem);
    });
}

async function loadWasteHistory() {
    const response = await fetch("/api/waste-history");
    const data = await response.json();

    if (data.success) {
        renderWasteHistory(data.reports);
    }
}

if (wasteForm) {
    wasteForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(wasteForm);

        const response = await fetch("/api/waste-report", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                issueType: formData.get("issueType"),
                location: formData.get("location"),
                details: formData.get("details"),
                latitude: formData.get("latitude"),
                longitude: formData.get("longitude")
            })
        });

        const data = await response.json();

        alert(data.message);

        if (data.success) {
            wasteForm.reset();

            if (selectedMarker) {
                wasteMap.removeLayer(selectedMarker);
                selectedMarker = null;
            }

            loadWasteHistory();
        }
    });
}

loadWasteHistory();