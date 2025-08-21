document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem('token'); // دریافت توکن از localStorage

    if (!token) {
        alert('لطفاً ابتدا وارد شوید.');
        window.location.href = '/login/';
        return;
    }

    // دکمه تایید لاگ اوت
        document.getElementById('logout-confirm-btn').addEventListener('click', function() {
            logout();
        });

        // دکمه لغو
        document.getElementById('cancel-btn').addEventListener('click', function() {
            // برگرداندن کاربر به صفحه قبلی
            window.history.back();  // بر می‌گرداند به صفحه قبلی که کاربر از آن آمده است
        });

    // تابع لاگ اوت
    function logout() {
        fetch('/api/logout/', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.detail === 'Successfully logged out.') {
                // پاک کردن توکن از localStorage
                localStorage.removeItem('token');
                // هدایت به صفحه اصلی
                window.location.href = '/';
            } else {
                alert('خطا در انجام عملیات لاگ اوت.');
            }
        })
        .catch(error => {
            console.error('Error during logout:', error);
            alert('خطا در انجام عملیات لاگ اوت.');
        });
    }
});
