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
