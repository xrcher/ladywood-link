fetch('/api/points')
    .then(res => res.json())
    .then(data => {
        if (!data.success) return;

        const dashboardPoints = document.getElementById('dashboard-points');

        if (dashboardPoints) {
            dashboardPoints.textContent = `${data.points} earned`;
        }
    })
    .catch(error => {
        console.error('Failed to load points:', error);
    });