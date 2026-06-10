const cards = document.querySelectorAll('.reward-card');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');

let currentIndex = 0;

function cardsPerPage() {
    return window.innerWidth <= 900 ? 1 : 3;
}

function updateCards() {
    const visibleCount = cardsPerPage();

    cards.forEach((card, index) => {
        const shouldShow =
            index >= currentIndex && index < currentIndex + visibleCount;

        card.classList.toggle('hidden-card', !shouldShow);
    });
}

if (nextBtn && prevBtn && cards.length > 0) {
    nextBtn.addEventListener('click', () => {
        const visibleCount = cardsPerPage();

        currentIndex += visibleCount;

        if (currentIndex >= cards.length) {
            currentIndex = 0;
        }

        updateCards();
    });

    prevBtn.addEventListener('click', () => {
        const visibleCount = cardsPerPage();

        currentIndex -= visibleCount;

        if (currentIndex < 0) {
            currentIndex = Math.max(cards.length - visibleCount, 0);
        }

        updateCards();
    });

    window.addEventListener('resize', () => {
        currentIndex = 0;
        updateCards();
    });

    updateCards();
}

function loadPoints() {
    fetch('/api/points')
        .then(res => res.json())
        .then(data => {
            if (!data.success) return;

            document.getElementById('points-balance').textContent =
                `${data.points} Green Points`;
        })
        .catch(error => {
            console.error('Failed to load points:', error);
        });
}

function loadRewardHistory() {
    fetch('/api/reward-history')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('reward-history');

            if (!container) return;

            if (data.length === 0) {
                container.innerHTML =
                    '<p>No rewards redeemed yet.</p>';
                return;
            }

            container.innerHTML = '';

            data.forEach(item => {
                container.innerHTML += `
                    <div class="history-item">
                        <strong>${item.reward_name}</strong>
                        <span>- ${item.points_spent} points</span>
                    </div>
                `;
            });
        })
        .catch(error => {
            console.error('Failed to load reward history:', error);
        });
}

document.querySelectorAll('.redeem-btn').forEach((button) => {
    button.addEventListener('click', async () => {
        const cost = Number(button.dataset.cost);

        const rewardCard = button.closest('.reward-card');
        const rewardName = rewardCard.querySelector('h2').textContent;

        const response = await fetch('/redeem', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cost,
                rewardName
            })
        });

        const data = await response.json();

        if (!data.success) {
            alert(data.message);
            return;
        }

        document.getElementById('points-balance').textContent =
            `${data.points} Green Points`;

        alert('Reward redeemed successfully!');

        loadRewardHistory();
    });
});

loadPoints();
loadRewardHistory();