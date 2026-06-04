const recyclingForm = document.getElementById('recyclingForm');
const recyclingHistory = document.getElementById('recycling-history');

async function loadRecyclingHistory() {
    try {
        const response = await fetch('/api/recycling-history');
        const data = await response.json();

        if (!data.success || data.logs.length === 0) {
            recyclingHistory.innerHTML =
                '<p class="empty-history">No recycling logs yet.</p>';
            return;
        }

        recyclingHistory.innerHTML = data.logs.map((log) => {
            const date = new Date(log.created_at).toLocaleDateString();

            return `
                <div class="history-item">
                    <div class="history-location">${log.location}</div>
                    <div>${log.weight}kg recycled</div>
                    <div class="history-points">+${log.points_earned} points</div>
                    <div class="history-date">${date}</div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Failed to load recycling history:', error);

        recyclingHistory.innerHTML =
            '<p class="empty-history">Could not load recycling history.</p>';
    }
}

if (recyclingForm) {
    recyclingForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(recyclingForm);

        const data = {
            weight: formData.get('weight'),
            location: formData.get('location'),
            notes: formData.get('notes')
        };

        try {
            const response = await fetch('/api/recycling-log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            alert(result.message);

            if (result.success) {
                recyclingForm.reset();
                loadRecyclingHistory();
            }

        } catch (error) {
            console.error('Failed to submit recycling report:', error);
            alert('Could not submit recycling report.');
        }
    });
}

loadRecyclingHistory();