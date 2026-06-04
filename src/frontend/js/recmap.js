// Ladywood coordinates
const map = L.map("map").setView([52.4756, -1.9348], 14);

L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution: "&copy; OpenStreetMap contributors"
  }
).addTo(map);

// Example markers
L.marker([52.49348113607801, -1.9139657866556745])
  .addTo(map)
  .bindPopup("Enviro City");

L.marker([52.484936097057066, -1.9260249978629895])
  .addTo(map)
  .bindPopup("Roba Metals Ltd");

L.marker([52.47252062104807, -1.9240508922181054])
  .addTo(map)
  .bindPopup("Green Channel Recycling Limited ");