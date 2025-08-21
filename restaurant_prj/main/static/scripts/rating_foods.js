document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error("Authentication token is missing.");
        alert("You need to log in first.");
        window.location.href = "/login"; // Redirect to login page if token is missing
        return; // Stop execution if token is missing
    }

    const orderId = window.location.pathname.split('/')[2];  // گرفتن آیدی سفارش از URL
    console.log(orderId);

    // ارسال درخواست POST به API با اضافه کردن orderId به بدنۀ درخواست
    fetch(`/api/profile/completed-orders/${orderId}/rate/`, {
        method: 'POST',
        headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            order_id: orderId // ارسال order_id در بدنه درخواست
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const orderItems = data.order_items;
            const container = document.getElementById('order-items-container');

            orderItems.forEach(item => {
                const food = item.food;
                const foodDiv = document.createElement('div');
                foodDiv.classList.add('food-item');
                foodDiv.innerHTML = `
                    <h3>${food.name}</h3>
                    <p>${food.description}</p>
                    <p>قیمت: ${item.total_price} تومان</p>
                    <label for="rating-${food.id}">امتیاز:</label>
                    <div class="rating">
                        <input type="radio" id="star5-${food.id}" name="rating-${food.id}" value="5">
                        <label for="star5-${food.id}">&#9733;</label>
                        <input type="radio" id="star4-${food.id}" name="rating-${food.id}" value="4">
                        <label for="star4-${food.id}">&#9733;</label>
                        <input type="radio" id="star3-${food.id}" name="rating-${food.id}" value="3">
                        <label for="star3-${food.id}">&#9733;</label>
                        <input type="radio" id="star2-${food.id}" name="rating-${food.id}" value="2">
                        <label for="star2-${food.id}">&#9733;</label>
                        <input type="radio" id="star1-${food.id}" name="rating-${food.id}" value="1">
                        <label for="star1-${food.id}">&#9733;</label>
                    </div>
                `;
                container.appendChild(foodDiv);
            });
        } else {
            alert('غذاهای مرتبط با این سفارش یافت نشد.');
        }
    })
    .catch(error => {
        alert('خطا در بارگذاری داده‌ها.');
    });

    // دکمه برگشت
    document.getElementById('back-button').addEventListener('click', function () {
        window.history.back(); // برگشت به صفحه قبلی
    });

    // دکمه ثبت امتیاز (برای همه غذاها)
    document.getElementById('submit-rating-button').addEventListener('click', function () {
        const ratings = [];
        document.querySelectorAll('.food-item').forEach(foodItem => {
            const foodId = foodItem.querySelector('input[name^="rating-"]').getAttribute('name').split('-')[1];
            const ratingInput = foodItem.querySelector(`input[name="rating-${foodId}"]:checked`);

            if (ratingInput) {
                const rating = parseInt(ratingInput.value);
                ratings.push({ food: foodId, rating: rating , order_id: orderId });
            }
        });

        if (ratings.length === 0) {
            alert('لطفاً حداقل به یکی از غذاها امتیاز دهید.');
            return;
        }

        // ارسال امتیاز به API برای هر غذا جداگانه
        ratings.forEach(rating => {
            fetch('/api/rate_food/', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(rating)  // ارسال امتیاز برای هر غذا جداگانه
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('امتیاز شما با موفقیت ثبت شد!');
                    window.location.href = '/customer-profile/';
                } else {
                    alert('خطا در ثبت امتیاز.');
                }
            })
            .catch(error => {
                alert('خطا در ارتباط با سرور.');
            });
        });
    });
});
