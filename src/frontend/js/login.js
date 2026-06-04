document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.login-form');
    const errorBox = document.getElementById('error-message');

    if (!form) {
        console.error("❌ JavaScript Error: Could not find the .login-form element!");
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorBox.style.display = 'none';

        const formData = new URLSearchParams(new FormData(form));

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                window.location.href = data.redirect;
            } else {
                errorBox.textContent = data.message;
                errorBox.style.display = 'block';
            }
        } catch (err) {
            console.error("💥 Network Error:", err);
            errorBox.textContent = "Unable to reach security servers. Please try again.";
            errorBox.style.display = 'block';
        }
    });
});