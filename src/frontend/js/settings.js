function applySavedSettings() {
    const savedTheme = localStorage.getItem("theme");
    const savedColourMode = localStorage.getItem("colourMode");
    const savedFont = localStorage.getItem("font");

    document.body.classList.remove(
        "dark-mode",
        "high-contrast",
        "font-arial",
        "font-comic-sans",
        "font-verdana",
        "font-tahoma",
        "font-century-gothic",
        "font-trebuchet"
    );

    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
    }

    if (savedColourMode === "high-contrast") {
        document.body.classList.add("high-contrast");
    }

    if (savedFont) {
        document.body.classList.add("font-" + savedFont);
    }
}

applySavedSettings();

const fontSelect = document.getElementById("font-select");
const themeSelect = document.getElementById("theme-mode");
const colourMode = document.getElementById("colour-mode");
const languageSelect = document.getElementById("language-select");
const saveButton = document.getElementById("save-accessibility-btn");

if (fontSelect && themeSelect && colourMode && languageSelect && saveButton) {
    if (localStorage.getItem("font")) fontSelect.value = localStorage.getItem("font");
    if (localStorage.getItem("theme")) themeSelect.value = localStorage.getItem("theme");
    if (localStorage.getItem("colourMode")) colourMode.value = localStorage.getItem("colourMode");
    if (localStorage.getItem("language")) languageSelect.value = localStorage.getItem("language");

    fontSelect.addEventListener("change", () => {
        localStorage.setItem("font", fontSelect.value);
        applySavedSettings();
    });

    themeSelect.addEventListener("change", () => {
        localStorage.setItem("theme", themeSelect.value);
        applySavedSettings();
    });

    colourMode.addEventListener("change", () => {
        localStorage.setItem("colourMode", colourMode.value);
        applySavedSettings();
    });

    languageSelect.addEventListener("change", () => {
        localStorage.setItem("language", languageSelect.value);
    });

    saveButton.addEventListener("click", () => {
        localStorage.setItem("font", fontSelect.value);
        localStorage.setItem("theme", themeSelect.value);
        localStorage.setItem("colourMode", colourMode.value);
        localStorage.setItem("language", languageSelect.value);

        applySavedSettings();

        alert("Accessibility settings saved.");
    });
}