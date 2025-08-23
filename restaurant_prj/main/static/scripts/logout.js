document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem('token'); // دریافت توکن از localStorage

    if (!token) {
        alert('Please login first.');
        window.location.href = '/login/';
        return;
    }

    // confirm logout btn
        document.getElementById('logout-confirm-btn').addEventListener('click', function() {
            logout();
        });

        // cancel btn
        document.getElementById('cancel-btn').addEventListener('click', function() {
            // return user back to previous page
            window.history.back();
        });

    // logout function
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
                // remove token from localStorage
                localStorage.removeItem('token');
                // redirect to main page
                window.location.href = '/';
            } else {
                alert('Error while logout.');
            }
        })
        .catch(error => {
            console.error('Error during logout:', error);
            alert('Error while logout.');
        });
    }
});
