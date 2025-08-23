document.addEventListener("DOMContentLoaded", function () {
    const tabLinks = document.querySelectorAll('.tab-link');
    const contentSections = document.querySelectorAll('.content-section');
    const ACTIVE_TAB_KEY = 'activeTab';

    // show active tab
    function showTab(tabId) {
        contentSections.forEach(section => {
            section.style.display = section.id === tabId ? 'block' : 'none';
        });

        tabLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-target') === tabId);
        });

        // save active tab name
        localStorage.setItem(ACTIVE_TAB_KEY, tabId);
    }

    // set clicks on tab links
    tabLinks.forEach(link => {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            const target = link.getAttribute('data-target');
            showTab(target);
        });
    });

    // Retrieve active tab from localStorage or show default tab
    const savedTab = localStorage.getItem(ACTIVE_TAB_KEY);
    const defaultTab = tabLinks[0]?.getAttribute('data-target'); // First tab as default tab
    showTab(savedTab || defaultTab);

    // loading order histories
    function loadOrderHistory() {
        fetch('/api/order-history/', {
            headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`
            }
        })
            .then(response => {
                if (response.status === 200) {
                    return response.json();
                } else {
                    throw new Error('No order found.');
                }
            })
            .then(data => {
                const ordersList = data.map(order => {
                    const itemsList = order.items.map(item => `
            <div class="order-item-detail">
                <p>food: ${item.food.name}</p>
                <p>price: ${item.food.price} $</p>
                <p>quantity: ${item.quantity}</p>
            </div>
        `).join('');

                    // get total price
                    const totalPrice = order.total_price;
                    const discountedPrice = order.discounted_price;

                    let discountInfo = '';
                    if (discountedPrice < totalPrice) {
                        discountInfo = `
                <p><strong>price before discount:</strong> ${totalPrice} $</p>
                <p><strong>price after discount:</strong> ${discountedPrice} $</p>
            `;
                    }

                    // show discounts list
                    let couponDetails = '';
                    if (order.coupons && order.coupons.length > 0) {
                        couponDetails = order.coupons.map(coupon => `
                <p><strong>discount code:</strong> ${coupon.code} (${coupon.discount}% OFF)</p>
            `).join('');
                    }

                    // cancel order btn for orders with 'pending' status
                    let cancelButton = '';
                    if (order.status === 'Pending') {
                        cancelButton = `
                <button class="btn btn-danger cancel-order-btn" data-order-id="${order.id}">
                    cencel order
                </button>
            `;
                    }

                    return `
            <div class="order-item border p-2 mb-2">
                <p><strong>order ID:</strong> ${order.id}</p>
                <p><strong>date:</strong>${new Date(order.created_at).toLocaleDateString("fa-IR")}</p>
                <h4>order items:</h4>
                ${itemsList}
                <p><strong>status:</strong> ${order.status}</p>
                <h4>price info:</h4>
                <p><strong>total price:</strong> ${totalPrice} $</p> 
                ${discountInfo}
                ${couponDetails}
                ${cancelButton}
            </div>
        `;
                }).join('');
                document.getElementById('order-history').innerHTML = `
        <h2>orders history</h2>
        ${ordersList}
    `;

                // Add cancel order button functionality
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

    // cancel order
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
                    alert('Your order has been canceled successfully.');
                    loadOrderHistory(); // بارگذاری مجدد تاریخچه سفارشات
                } else {
                    return response.json().then(data => {
                        throw new Error(data.error || 'Error while canceling the order..');
                    });
                }
            })
            .catch(error => {
                alert(error.message);
            });
    }

    // load order history
    loadOrderHistory();
});
