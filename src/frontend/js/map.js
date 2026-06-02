// Ladywood coordinates
const map = L.map("map").setView([52.4756, -1.9348], 14);

L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution: "&copy; OpenStreetMap contributors"
  }
).addTo(map);

// Example markers
L.marker([52.478, -1.932])
  .addTo(map)
  .bindPopup("Overflowing bin reported");

L.marker([52.474, -1.939])
  .addTo(map)
  .bindPopup("Sewage alert");

L.marker([52.472, -1.929])
  .addTo(map)
  .bindPopup("Recycling point");