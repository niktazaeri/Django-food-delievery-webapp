document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login to your account first.');
        window.location.href = '/login/';
        return;
    }

    const orderId = window.location.pathname.split('/')[2];

    fetch(`/api/order-details/${orderId}/`, {
        method: 'GET',
        headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (response.status === 403) {
            alert('This order does not belong to you.');
            window.location.href = '/';
            return;
        }
        return response.json();
    })
    .then(data => {
        if (data.message) {
            alert(data.message);
            window.history.back();
            return;
        }

        const addressTitle = data.address.title || 'without title';

        document.getElementById('address').textContent = `${addressTitle} - ${data.address.address} - ${data.address.details}`;
        document.getElementById('total-price').textContent = `${data.discounted_price} $`;

        const itemsList = document.getElementById('order-items');
        data.items.forEach(item => {
            const listItem = document.createElement('li');
            listItem.textContent = `${item.food.name} - quantity : ${item.quantity} - ${item.total} $`;
            itemsList.appendChild(listItem);
        });

        const discountInfo = `
            <p>first price: ${data.total_price} $</p>
            <p>discount: ${data.discount}%</p>
            <p>final price: ${data.discounted_price} $</p>
        `;
        document.getElementById('order-details').innerHTML += discountInfo;
    })
    .catch(error => {
        console.error('Error loading order details:', error);
        alert('error during loading order details.');
    });

    document.getElementById('back-to-home').addEventListener('click', function () {
        window.location.href = '/';
    });
});
