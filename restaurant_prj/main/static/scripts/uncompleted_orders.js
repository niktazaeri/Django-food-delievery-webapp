document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please log in first.');
        window.location.href = '/login/';
        return;
    }

    const uncompletedOrdersList = document.getElementById("uncompletedOrdersList");

    // Fetch uncompleted orders from the API
    function fetchUncompletedOrders() {
        fetch('/api/uncompleted-orders/', {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                "Content-Type": "application/json",
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                displayUncompletedOrders(data);
                setActiveTabInCookie("UncompletedOrdersListSection")
            })
            .catch(error => {
                console.error('Error fetching uncompleted orders:', error);
            });
    }

    // Display uncompleted orders
    function displayUncompletedOrders(orders) {
        uncompletedOrdersList.innerHTML = ""; // Clear existing content

        orders.forEach(order => {
            const card = document.createElement('div');
            card.className = 'card col-md-4 mb-3';

            const cardBody = document.createElement('div');
            cardBody.className = 'card-body';

            const orderTitle = document.createElement('h5');
            orderTitle.className = 'card-title';
            orderTitle.textContent = `Order #${order.id}`;

            const orderDetails = document.createElement('p');
            orderDetails.className = 'card-text';
            orderDetails.textContent = `Customer: ${order.username} (${order.first_name} ${order.last_name}) 
             Status: ${order.status}`;

            const orderDate = document.createElement('p');
            orderDate.className = 'card-text';
            orderDate.textContent = `Created At: ${new Date(order.created_at).toLocaleString()}`;

            const completeOrderBtn = document.createElement('button');
            completeOrderBtn.className = 'btn btn-complete';
            completeOrderBtn.textContent = 'Complete Order';
            completeOrderBtn.addEventListener('click', () => completeOrder(order.id, completeOrderBtn));

            cardBody.appendChild(orderTitle);
            cardBody.appendChild(orderDetails);
            cardBody.appendChild(orderDate);
            cardBody.appendChild(completeOrderBtn);
            card.appendChild(cardBody);

            uncompletedOrdersList.appendChild(card);
        });
    }

    // Complete an order
    function completeOrder(orderId, button) {
        fetch(`/api/uncompleted-orders/${orderId}/complete/`, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({order_id: orderId})
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Change the button state
                button.disabled = true;
                button.classList.remove('btn-success');
                button.classList.add('btn-secondary');
                button.innerHTML = `<span>Order Completed ✔</span>`;

                // Show a modal
                showToast(`Order #${orderId} completed successfully!`);

                // Refresh page after a delay
                setTimeout(() => {
                    location.reload();
                }, 3000);
            })
            .catch(error => {
                console.error('Error completing order:', error);
            });
    }

    function showToast(message) {
        const toastContainer = document.getElementById('toastContainer');

        const toastHtml = `
        <div class="toast align-items-center text-bg-toast border-0 show" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;

        // اضافه کردن اعلان به داخل container
        toastContainer.insertAdjacentHTML('beforeend', toastHtml);

        // حذف اعلان بعد از چند ثانیه
        setTimeout(() => {
            const toast = toastContainer.querySelector('.toast');
            if (toast) {
                toast.remove();
            }
        }, 3000);
    }

    // Initial setup
    fetchUncompletedOrders();
});
