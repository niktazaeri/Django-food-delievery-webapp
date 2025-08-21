document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem('token');
    const addressesContainer = document.getElementById('addresses-container');
    const confirmOrderButton = document.getElementById('confirm-order-button');
    const backButton = document.getElementById('back-button'); // دکمه برگشت

    if (!token) {
        alert('لطفاً ابتدا وارد شوید.');
        window.location.href = '/login/';
        return;
    }

    // بارگذاری آدرس‌ها
    fetch('/api/addresses/', {
        method: 'GET',
        headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.length === 0) {
            addressesContainer.innerHTML = '<p>شما هیچ آدرسی ذخیره نکرده‌اید.</p>';
            return;
        }

        // نمایش آدرس‌ها
        data.forEach(address => {
            const addressElement = document.createElement('div');
            addressElement.className = 'address-item';

            // بررسی اینکه عنوان آدرس null نباشد و در صورت null بودن، متن "بدون عنوان" قرار دهیم
            const title = address.title ? address.title : 'بدون عنوان';

            addressElement.innerHTML = `
                <input type="radio" name="address" value="${address.id}" id="address-${address.id}">
                <label for="address-${address.id}">
                    ${title} - ${address.address} - ${address.details} - ${address.postal_code}
                </label>
            `;

            // علامت‌گذاری آدرس انتخاب‌شده
            if (localStorage.getItem('selectedAddressId') === address.id.toString()) {
                addressElement.querySelector('input').checked = true;
            }
            addressesContainer.appendChild(addressElement);
        });
    })
    .catch(error => {
        console.error('Error loading addresses:', error);
        alert('خطا در بارگذاری آدرس‌ها.');
    });

    // تایید سفارش
    confirmOrderButton.addEventListener('click', function () {
        const selectedAddressId = document.querySelector('input[name="address"]:checked')?.value;

        if (!selectedAddressId) {
            alert('لطفاً یک آدرس انتخاب کنید.');
            return;
        }

        // ذخیره آدرس انتخاب‌شده در لوکال‌استور
        localStorage.setItem('selectedAddressId', selectedAddressId);

        // هدایت به صفحه پیش‌نمایش سفارش
        window.location.href = '/order-preview/';
    });

    // دکمه برگشت
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = '/cart/'; // برگشت به صفحه قبلی
        });
    }
});
