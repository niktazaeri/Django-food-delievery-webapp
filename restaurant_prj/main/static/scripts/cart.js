document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('لطفاً ابتدا وارد شوید.');
        window.location.href = '/login/';
        return;
    }

    // افزودن غذا به سبد خرید
    const addToCart = (foodId) => {
        fetch('/api/add-to-cart/', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ food_id: foodId, quantity: 1 }),
        })
            .then((response) => {
                if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
                return response.json();
            })
            .then((data) => {
                alert(data.message || 'به سبد خرید اضافه شد!');
                reloadCartItems();
                updateCartIcon();
            })
            .catch((error) => {
                console.error('Error adding to cart:', error);
                alert('خطا در افزودن به سبد خرید.');
            });
    };

    // حذف آیتم از سبد خرید
    const deleteCartItem = (itemId) => {
        fetch('/api/delete-cart-item/', {
            method: 'DELETE',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ item_id: itemId }),
        })
            .then((response) => response.json())
            .then((data) => {
                alert(data.message || 'آیتم حذف شد.');
                reloadCartItems();
                updateCartIcon();
            })
            .catch((error) => {
                console.error('Error deleting cart item:', error);
                alert('خطا در حذف آیتم.');
            });
    };

    // بروزرسانی آیتم در سبد خرید
    const updateCartItem = (itemId, action) => {
        fetch('/api/update-cart-item/', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ item_id: itemId, action: action }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.message) {
                    alert(data.message);
                }
                reloadCartItems();
                updateCartIcon();
            })
            .catch((error) => {
                console.error('Error updating cart item:', error);
                alert('خطا در بروزرسانی آیتم سبد خرید.');
            });
    };

    // بارگذاری آیتم‌های سبد خرید
    const reloadCartItems = () => {
    fetch('/api/view-cart/', {
        method: 'GET',
        headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
        },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            const cartContainer = document.getElementById('cart-items-container');
            if (!cartContainer) {
                console.error('Cart container not found!');
                return;
            }
            cartContainer.innerHTML = '';

            // اگر سبد خرید خالی باشد
            if (!data || data.length === 0) {
                cartContainer.innerHTML = '<p>سبد خرید شما خالی است.</p>';
                // حذف دکمه ثبت سفارش اگر سبد خرید خالی باشد
            const checkoutButton = document.getElementById('checkout-button');
            if (checkoutButton) {
                checkoutButton.remove();
            }
            return;
            }

            let totalPrice = 0;
            data.forEach((item) => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div class="cart-item-details">
                        <p>نام: ${item.food.name}</p>
                        <p>قیمت: ${item.food.price} تومان</p>
                        <p>تعداد: <span class="quantity">${item.quantity}</span></p>
                        <p>مبلغ کل: <span class="total-price">${item.total_price}</span></p>
                    </div>
                    <div class="cart-item-actions">
                        <button class="increase-quantity" data-item-id="${item.id}">افزایش</button>
                        <button class="decrease-quantity" data-item-id="${item.id}">کاهش</button>
                        <button class="delete-item" data-item-id="${item.id}">حذف</button>
                    </div>
                `;
                totalPrice += item.total_price;
                cartContainer.appendChild(cartItem);
            });

            // مدیریت نمایش مبلغ نهایی
            const totalPriceContainer = document.getElementById('total-price-container');
            if (!totalPriceContainer) {
                const newTotalPriceContainer = document.createElement('div');
                newTotalPriceContainer.id = 'total-price-container';
                newTotalPriceContainer.className = 'total-price-container';
                newTotalPriceContainer.innerHTML = `
                    <p>مبلغ نهایی: <span id="final-price">${totalPrice} تومان</span></p>
                `;
                cartContainer.appendChild(newTotalPriceContainer);
            } else {
                const finalPriceElement = totalPriceContainer.querySelector('#final-price');
                finalPriceElement.textContent = `${totalPrice} تومان`;
            }

            // بررسی و اضافه کردن دکمه ثبت سفارش فقط اگر قبلاً اضافه نشده باشد
        const buttonsContainer = document.getElementById('buttons-container');
        if (!document.getElementById('checkout-button')) {
            const checkoutButton = document.createElement('button');
            checkoutButton.id = 'checkout-button';
            checkoutButton.className = 'btn mt-4';
            checkoutButton.textContent = 'ثبت سفارش';
            buttonsContainer.appendChild(checkoutButton);

            // رویداد دکمه ثبت سفارش
            checkoutButton.addEventListener('click', function () {
                window.location.href = '/select-address/';
            });
        }
        })
        .catch((error) => {
            console.error('Error loading cart items:', error);
            alert('خطا در بارگذاری سبد خرید.');
        });
};


    // بروزرسانی تعداد آیتم‌ها در آیکن سبد خرید
    const updateCartIcon = () => {
        fetch('/api/view-cart/', {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
            },
        })
            .then((response) => response.json())
            .then((data) => {
                const uniqueItemsCount = data.length;
                const cartCount = document.getElementById('cart-count');
                cartCount.innerText = uniqueItemsCount || 0;
            })
            .catch((error) => {
                console.error('Error updating cart icon:', error);
            });
    };

    // مدیریت کلیک روی دکمه‌ها
    document.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('add-to-cart-button')) {
            const foodId = target.getAttribute('data-food-id');
            addToCart(foodId);
        } else if (target.classList.contains('increase-quantity')) {
            const itemId = target.getAttribute('data-item-id');
            updateCartItem(itemId, 'increase');
        } else if (target.classList.contains('decrease-quantity')) {
            const itemId = target.getAttribute('data-item-id');
            updateCartItem(itemId, 'decrease');
        } else if (target.classList.contains('delete-item')) {
            const itemId = target.getAttribute('data-item-id');
            deleteCartItem(itemId);
        }
    });

    // افزودن event listener برای دکمه بازگشت
    document.getElementById('back-button').addEventListener('click', function () {
        window.location.href = '/customer-dashboard/'; // برگشت به صفحه قبلی

    });

    // بارگذاری داده‌ها
    reloadCartItems();
    updateCartIcon();
});
