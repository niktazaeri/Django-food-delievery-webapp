document.addEventListener("DOMContentLoaded", function () {

    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please log in to your account first.');
        window.location.href = '/login/';
        return;
    }

    // Variables to store references to HTML elements
    const completedOrdersList = document.getElementById("completedOrdersList");

    // Fetch uncompleted orders from the API
    function fetchCompletedOrders() {
        fetch('/api/completed-orders/', {
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
            displayCompletedOrders(data);
            setActiveTabInCookie("completedOrdersSection")
        })
        .catch(error => {
            console.error('Error fetching completed orders:', error);
        });
    }

    // Display uncompleted orders
    function displayCompletedOrders(orders) {
        completedOrdersList.innerHTML = ""; // Clear existing content

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

            // Add the created_at date to the card
            const orderDate = document.createElement('p');
            orderDate.className = 'card-text';
            orderDate.textContent = `Created At: ${new Date(order.created_at).toLocaleString()}`; // Formatting the date

            // const completeOrderBtn = document.createElement('button');
            // completeOrderBtn.className = 'btn btn-success';
            // completeOrderBtn.textContent = 'Complete Order';
            // completeOrderBtn.addEventListener('click', () => completeOrder(order.id));

            cardBody.appendChild(orderTitle);
            cardBody.appendChild(orderDetails);
            cardBody.appendChild(orderDate);  // Add the created_at to the card
            // cardBody.appendChild(completeOrderBtn);
            card.appendChild(cardBody);

            completedOrdersList.appendChild(card);
        });
    }

    // // Complete an order
    // function completeOrder(orderId) {
    //     fetch(`/orders/${orderId}/complete/`, {
    //         method: 'POST',
    //         headers: {
    //             'Authorization': 'Token ' + localStorage.getItem('authToken'),
    //             'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify({})
    //     })
    //     .then(response => {
    //         if (!response.ok) {
    //             throw new Error(`HTTP error! status: ${response.status}`);
    //         }
    //         return response.json();
    //     })
    //     .then(() => {
    //         alert('Order completed successfully!');
    //         fetchUncompletedOrders(); // Refresh the list of uncompleted orders
    //     })
    //     .catch(error => {
    //         console.error('Error completing order:', error);
    //     });
    // }

    // Initial setup
    fetchCompletedOrders();

});
