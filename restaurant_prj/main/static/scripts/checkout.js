document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('لطفاً ابتدا وارد شوید.');
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
            alert('این سفارش متعلق به شما نیست.');
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

        const addressTitle = data.address.title || 'بدون عنوان';

        document.getElementById('address').textContent = `${addressTitle} - ${data.address.address} - ${data.address.details}`;
        document.getElementById('total-price').textContent = `${data.discounted_price} تومان`;

        const itemsList = document.getElementById('order-items');
        data.items.forEach(item => {
            const listItem = document.createElement('li');
            listItem.textContent = `${item.food.name} - ${item.quantity} عدد - ${item.total} تومان`;
            itemsList.appendChild(listItem);
        });

        const discountInfo = `
            <p>قیمت اولیه: ${data.total_price} تومان</p>
            <p>تخفیف: ${data.discount}%</p>
            <p>مبلغ نهایی: ${data.discounted_price} تومان</p>
        `;
        document.getElementById('order-details').innerHTML += discountInfo;
    })
    .catch(error => {
        console.error('Error loading order details:', error);
        alert('خطا در بارگذاری جزئیات سفارش.');
    });

    document.getElementById('back-to-home').addEventListener('click', function () {
        window.location.href = '/';
    });
});
