document.addEventListener("DOMContentLoaded", () => {

    /* ================================================= */
    /* POSTCODE SEARCH */
    /* ================================================= */

    const button = document.getElementById("postcodeBtn");

    if (button) {
        button.addEventListener("click", async () => {

            const postcode = document
                .getElementById("postcodeInput")
                .value
                .trim()
                .toUpperCase();

            if (!postcode) {
                return;
            }

            try {
                const response = await fetch(
                    `/api/bin-collection/${postcode}`
                );

                const data = await response.json();

                document.getElementById("collectionResult").innerHTML = `
                    <div class="card result-card">
                        <h2>${data.nextCollection}</h2>

                        <p>
                            <strong>Bin Type:</strong>
                            ${data.binType}
                        </p>

                        <p>
                            <strong>Area:</strong>
                            ${data.area}
                        </p>
                    </div>
                `;

            } catch (error) {
                document.getElementById("collectionResult").innerHTML = `
                    <p>Collection information unavailable.</p>
                `;

                console.error(error);
            }
        });
    }

    /* ================================================= */
    /* COLLECTION CALENDAR */
    /* ================================================= */

    const calendarGrid = document.getElementById("calendar-grid");
    const calendarTitle = document.getElementById("calendar-title");
    const prevMonthBtn = document.getElementById("prevMonthBtn");
    const nextMonthBtn = document.getElementById("nextMonthBtn");

    let currentCalendarDate = new Date(2026, 5, 1);

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    function getCollectionClass(day) {
        if ([2, 9, 16, 23, 30].includes(day)) {
            return "collection general";
        }

        if ([5, 19].includes(day)) {
            return "collection recycling";
        }

        if ([12, 26].includes(day)) {
            return "collection garden";
        }

        return "";
    }

    function renderCalendar() {
        if (!calendarGrid || !calendarTitle) return;

        const year = currentCalendarDate.getFullYear();
        const month = currentCalendarDate.getMonth();

        calendarTitle.textContent = `${monthNames[month]} ${year}`;
        calendarGrid.innerHTML = "";

        dayNames.forEach(day => {
            const dayHeading = document.createElement("span");
            dayHeading.textContent = day;
            calendarGrid.appendChild(dayHeading);
        });

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        let startOffset = firstDay.getDay() - 1;

        if (startOffset < 0) {
            startOffset = 6;
        }

        for (let i = 0; i < startOffset; i++) {
            const blank = document.createElement("div");
            blank.classList.add("empty-day");
            calendarGrid.appendChild(blank);
        }

        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dayBox = document.createElement("div");
            dayBox.textContent = day;

            const collectionClass = getCollectionClass(day);

            if (collectionClass) {
                collectionClass.split(" ").forEach(className => {
                    dayBox.classList.add(className);
                });
            }

            calendarGrid.appendChild(dayBox);
        }
    }

    if (prevMonthBtn && nextMonthBtn) {
        prevMonthBtn.addEventListener("click", () => {
            currentCalendarDate.setMonth(
                currentCalendarDate.getMonth() - 1
            );

            renderCalendar();
        });

        nextMonthBtn.addEventListener("click", () => {
            currentCalendarDate.setMonth(
                currentCalendarDate.getMonth() + 1
            );

            renderCalendar();
        });
    }

    renderCalendar();

});