document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        fetch('/api/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password,
            }),
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Invalid username or password');
            }
        })
        .then(data => {
            localStorage.setItem('token', data.token);
            // redirect to main page
            window.location.href = '/';
        })
        .catch(error => {
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
        });
    });
});
