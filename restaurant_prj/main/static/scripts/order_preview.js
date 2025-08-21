document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem('token');
    const selectedAddressId = localStorage.getItem('selectedAddressId');

    if (!token) {
        alert('لطفاً ابتدا وارد شوید.');
        window.location.href = '/login/';
        return;
    }

    if (!selectedAddressId) {
        alert('لطفاً آدرس خود را انتخاب کنید.');
        window.location.href = '/select-address/';
        return;
    }

    fetch('/api/order-preview/', {
        method: 'POST',
        headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address_id: selectedAddressId }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert(data.message);
            return;
        }

        const addressTitle = data.address.title || 'بدون عنوان'; // اگر عنوان null باشد، نمایش نمی‌دهد.
        const addressAddress = data.address.address;
        const addressDetails = data.address.details ;

        document.getElementById('address-title').innerText = addressTitle;
        document.getElementById('address-address').innerText = addressAddress;
        document.getElementById('address-details').innerText = addressDetails;

        const itemsContainer = document.getElementById('order-items');
        itemsContainer.innerHTML = data.items.map(item => `
            <div class="item">
                <p>نام: ${item.food.name}</p>
                <p>قیمت: ${item.food.price} تومان</p>
                <p>تعداد: ${item.quantity}</p>
                <p>جمع کل: ${item.total_price} تومان</p>
            </div>
        `).join('');

        let totalPrice = data.total_price;
        document.getElementById('total-price').innerText = `${totalPrice} تومان`;

        const discountFieldHTML = `
            <div class="discount">
                <h3>کد تخفیف:</h3>
                <input type="text" id="coupon-code" placeholder="کد تخفیف را وارد کنید">
                <button id="apply-coupon">اعمال تخفیف</button>
                <p id="discount-info"></p>
            </div>
        `;
        document.querySelector('.buttons').insertAdjacentHTML('beforebegin', discountFieldHTML);

        document.getElementById('apply-coupon').addEventListener('click', function () {
            const couponCode = document.getElementById('coupon-code').value;

            if (!couponCode) {
                alert('لطفاً کد تخفیف را وارد کنید.');
                return;
            }

            fetch('/api/apply-coupon/', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ coupon_code: couponCode }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.discounted_price) {
                    document.getElementById('discount-info').innerHTML = `
                        قبل از تخفیف: ${data.original_price} تومان | 
                        تخفیف: ${data.discount}% | 
                        مبلغ پس از تخفیف: ${data.discounted_price} تومان
                    `;
                    document.getElementById('total-price').innerText = `${data.discounted_price} تومان`;
                } else {
                    alert(data.message || 'خطا در اعمال تخفیف');
                }
            });
        });

        document.getElementById('back-to-address').addEventListener('click', () => {
            window.location.href = '/select-address/';
        });

        document.getElementById('submit-order').addEventListener('click', () => {
            const couponCode = document.getElementById('coupon-code').value;
            submitOrder(selectedAddressId, couponCode);
        });
    })
    .catch(error => {
        console.error('Error loading order preview:', error);
        alert('خطا در بارگذاری پیش‌نمایش سفارش.');
    });

    const submitOrder = (addressId, couponCode) => {
        fetch('/api/place-order/', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ address_id: addressId, coupon_code: couponCode }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('سفارش شما ثبت شد!');
                window.location.href = `/checkout/${data.order_id}/`;
            } else {
                alert('خطا در ثبت سفارش.');
            }
        })
        .catch(error => {
            console.error('Error submitting order:', error);
            alert('خطا در ثبت سفارش.');
        });
    };
});
