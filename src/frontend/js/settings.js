// =================================================
// APPLY SAVED SETTINGS ON EVERY PAGE
// =================================================

function applySavedSettings() {
    const theme = localStorage.getItem("theme") || "light";
    const colourMode = localStorage.getItem("colourMode") || "none";
    const font = localStorage.getItem("font") || "arial";

    document.body.classList.remove(
        "dark-mode",
        "high-contrast",
        "font-arial",
        "font-comic-sans",
        "font-verdana",
        "font-tahoma",
        "font-century-gothic",
        "font-trebuchet",
        "colour-red-green",
        "colour-blue-yellow"
    );

    if (theme === "dark") {
        document.body.classList.add("dark-mode");
    }

    if (colourMode === "high-contrast") {
        document.body.classList.add("high-contrast");
    }

    if (colourMode === "red-green") {
    document.body.classList.add("colour-red-green");
    }

    if (colourMode === "blue-yellow") {
    document.body.classList.add("colour-blue-yellow");
    }

    document.body.classList.add("font-" + font);
}

// =================================================
// GOOGLE TRANSLATE LANGUAGE CHANGE
// =================================================

function changeGoogleTranslateLanguage(language) {
    const googleSelect = document.querySelector(".goog-te-combo");

    if (!googleSelect) {
        setTimeout(() => changeGoogleTranslateLanguage(language), 500);
        return;
    }

    googleSelect.value = language;
    googleSelect.dispatchEvent(new Event("change"));
}

// =================================================
// SETTINGS PAGE CONTROLS
// =================================================

const fontSelect = document.getElementById("font-select");
const themeSelect = document.getElementById("theme-mode");
const colourModeSelect = document.getElementById("colour-mode");
const languageSelect = document.getElementById("language-select");
const saveButton = document.getElementById("save-accessibility-btn");

applySavedSettings();

if (fontSelect && themeSelect && colourModeSelect && languageSelect && saveButton) {
    fontSelect.value = localStorage.getItem("font") || "arial";
    themeSelect.value = localStorage.getItem("theme") || "light";
    colourModeSelect.value = localStorage.getItem("colourMode") || "none";
    languageSelect.value = localStorage.getItem("language") || "en";

    fontSelect.addEventListener("change", () => {
        localStorage.setItem("font", fontSelect.value);
        applySavedSettings();
    });

    themeSelect.addEventListener("change", () => {
        localStorage.setItem("theme", themeSelect.value);
        applySavedSettings();
    });

    colourModeSelect.addEventListener("change", () => {
        localStorage.setItem("colourMode", colourModeSelect.value);
        applySavedSettings();
    });

    languageSelect.addEventListener("change", () => {
        localStorage.setItem("language", languageSelect.value);
        changeGoogleTranslateLanguage(languageSelect.value);
    });

    saveButton.addEventListener("click", () => {
        localStorage.setItem("font", fontSelect.value);
        localStorage.setItem("theme", themeSelect.value);
        localStorage.setItem("colourMode", colourModeSelect.value);
        localStorage.setItem("language", languageSelect.value);

        applySavedSettings();
        changeGoogleTranslateLanguage(languageSelect.value);

        alert("Accessibility settings saved.");
    });
}

// =================================================
// APPLY SAVED LANGUAGE ON OTHER PAGES
// =================================================

const savedLanguage = localStorage.getItem("language");

if (savedLanguage && savedLanguage !== "en") {
    changeGoogleTranslateLanguage(savedLanguage);
}

const passwordButton = document.getElementById("save-password-btn");

if (passwordButton) {

    passwordButton.addEventListener("click", async () => {

        const newPassword =
            document.getElementById("new-password").value;

        const confirmPassword =
            document.getElementById("confirm-password").value;

        const response = await fetch("/api/change-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                newPassword,
                confirmPassword
            })
        });

        const data = await response.json();

        alert(data.message);

        if (data.success) {
            document.getElementById("new-password").value = "";
            document.getElementById("confirm-password").value = "";
        }
    });

}