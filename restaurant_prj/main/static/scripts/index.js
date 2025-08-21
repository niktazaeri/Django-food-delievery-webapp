document.addEventListener("DOMContentLoaded", () => {

    let tokenKey = document.cookie.split('; ').find(row => row.startsWith('auth_token'))
    console.log(tokenKey)
    if (tokenKey !== undefined){
        tokenKey = tokenKey.split('=')[1]
        if (tokenKey) {
        fetch('/api/user/role/', {
            method: 'GET',
            headers: {
                'Authorization': `Token ${tokenKey}`,
            },
        })
        .then(response => response.json())
        // .then(data => {
        //     const role = data.role;
        //
        //
        //     if (role === 'admin') {
        //         document.getElementById('user-role-message').innerText = 'شما به عنوان مدیر وارد شده‌اید.';
        //         document.getElementById('admin-dashboard').style.display = 'block';
        //     } else if (role === 'customer') {
        //         document.getElementById('user-role-message').innerText = 'شما به عنوان مشتری وارد شده‌اید.';
        //         document.getElementById('customer-dashboard').style.display = 'block';
        //     } else if (role === 'employee') {
        //         document.getElementById('user-role-message').innerText = 'شما به عنوان کارمند وارد شده‌اید.';
        //         document.getElementById('employee-dashboard').style.display = 'block';
        //     }
        // })
        .catch(() => {
            document.getElementById('login-message').style.display = 'block';
            document.getElementById('register-message').style.display = 'block';
        });
    }
    }
     else {

        document.getElementById('login-message').style.display = 'block';
        document.getElementById('register-message').style.display = 'block';
    }
});
