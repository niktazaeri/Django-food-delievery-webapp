document.addEventListener("DOMContentLoaded", function () {
    const tabLinks = document.querySelectorAll('.tab-link');
    const contentSections = document.querySelectorAll('.content-section');
    const ACTIVE_TAB_KEY = 'activeTab';

    // نمایش تب فعال
    function showTab(tabId) {
        contentSections.forEach(section => {
            section.style.display = section.id === tabId ? 'block' : 'none';
        });

        tabLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-target') === tabId);
        });

        // ذخیره نام تب فعال
        localStorage.setItem(ACTIVE_TAB_KEY, tabId);
    }

    // ثبت کلیک روی لینک‌های تب
    tabLinks.forEach(link => {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            const target = link.getAttribute('data-target');
            showTab(target);
        });
    });

    // بازیابی تب فعال از localStorage یا نمایش تب پیش‌فرض
    const savedTab = localStorage.getItem(ACTIVE_TAB_KEY);
    const defaultTab = tabLinks[0]?.getAttribute('data-target'); // اولین تب به عنوان پیش‌فرض
    showTab(savedTab || defaultTab);

    // عملکرد بارگذاری تاریخچه سفارشات
    function loadOrderHistory() {
        fetch('/api/order-history/', {
            headers: {
                'Authorization': `Token ${localStorage.getItem('token')}` // دریافت توکن از محل ذخیره‌سازی
            }
        })
            .then(response => {
                if (response.status === 200) {
                    return response.json();
                } else {
                    throw new Error('سفارشی یافت نشد.');
                }
            })
            .then(data => {
                const ordersList = data.map(order => {
                    const itemsList = order.items.map(item => `
            <div class="order-item-detail">
                <p>نام غذا: ${item.food.name}</p>
                <p>قیمت: ${item.food.price} تومان</p>
                <p>تعداد: ${item.quantity}</p>
            </div>
        `).join('');

                    // گرفتن قیمت کل
                    const totalPrice = order.total_price;
                    const discountedPrice = order.discounted_price;

                    let discountInfo = '';
                    if (discountedPrice < totalPrice) {
                        discountInfo = `
                <p><strong>قیمت قبل از تخفیف:</strong> ${totalPrice} تومان</p>
                <p><strong>قیمت با تخفیف:</strong> ${discountedPrice} تومان</p>
            `;
                    }

                    // نمایش لیست تخفیف‌ها اگر وجود داشته باشند
                    let couponDetails = '';
                    if (order.coupons && order.coupons.length > 0) {
                        couponDetails = order.coupons.map(coupon => `
                <p><strong>کد تخفیف:</strong> ${coupon.code} (${coupon.discount}% تخفیف)</p>
            `).join('');
                    }

                    // دکمه لغو سفارش فقط برای سفارشات Pending
                    let cancelButton = '';
                    if (order.status === 'Pending') {
                        cancelButton = `
                <button class="btn btn-danger cancel-order-btn" data-order-id="${order.id}">
                    لغو سفارش
                </button>
            `;
                    }

                    return `
            <div class="order-item border p-2 mb-2">
                <p><strong>کد سفارش:</strong> ${order.id}</p>
                <p><strong>تاریخ:</strong>${new Date(order.created_at).toLocaleDateString("fa-IR")}</p>
                <h4>آیتم‌های سفارش:</h4>
                ${itemsList}
                <p><strong>وضعیت:</strong> ${order.status}</p>
                <h4>اطلاعات قیمت:</h4>
                <p><strong>مبلغ کل:</strong> ${totalPrice} تومان</p> 
                ${discountInfo}
                ${couponDetails}
                ${cancelButton}
            </div>
        `;
                }).join('');
                document.getElementById('order-history').innerHTML = `
        <h2>تاریخچه سفارشات</h2>
        ${ordersList}
    `;

                // افزودن عملکرد دکمه لغو سفارش
                document.querySelectorAll('.cancel-order-btn').forEach(button => {
                    button.addEventListener('click', function () {
                        const orderId = this.getAttribute('data-order-id');
                        cancelOrder(orderId);
                    });
                });
            })
            .catch(error => {
                document.getElementById('order-history').innerHTML = `
                <p class="text-danger">${error.message}</p>
            `;
            });
    }

    // تابع لغو سفارش
    function cancelOrder(orderId) {
        fetch(`/api/profile/order-history/${orderId}/cancel/`, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (response.status === 200) {
                    alert('سفارش با موفقیت لغو شد.');
                    loadOrderHistory(); // بارگذاری مجدد تاریخچه سفارشات
                } else {
                    return response.json().then(data => {
                        throw new Error(data.error || 'مشکلی در لغو سفارش وجود دارد.');
                    });
                }
            })
            .catch(error => {
                alert(error.message);
            });
    }

    // بارگذاری تاریخچه سفارشات
    loadOrderHistory();
});
