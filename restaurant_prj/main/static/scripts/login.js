document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // ارسال درخواست لاگین به API
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
                throw new Error('نام کاربری یا رمز عبور اشتباه است');
            }
        })
        .then(data => {
            // ذخیره توکن در کوکی
            // document.cookie = `auth_token=${data.token}; path=/; SameSite=Lax;`;
            localStorage.setItem('token', data.token);
            // هدایت به صفحه اصلی
            window.location.href = '/';
        })
        .catch(error => {
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
        });
    });
});
