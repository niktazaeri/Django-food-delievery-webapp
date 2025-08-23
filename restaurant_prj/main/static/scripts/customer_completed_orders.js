document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login to your account first.');
        window.location.href = '/login/';
        return;
    }

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

        // if completed orders tab , is active , retrieve its datas
        if (tabId === 'completed-orders') {
            fetchCompletedOrders();
        }
    }

    // clicking on active tabs
    tabLinks.forEach(link => {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            const target = link.getAttribute('data-target');
            showTab(target);
        });
    });

    // Retrieve active tab from localStorage or show default tab
    const savedTab = localStorage.getItem(ACTIVE_TAB_KEY);
    const defaultTab = tabLinks[0]?.getAttribute('data-target'); // first tab as default tab
    showTab(savedTab || defaultTab);

    // get completed orders from its api
    function fetchCompletedOrders() {
        const completedOrdersSection = document.getElementById("completed-orders");
        const ordersContainer = completedOrdersSection.querySelector(".orders-list");

        // If the list is already full, we won't resend the request.
        if (ordersContainer && ordersContainer.children.length > 0) {
            return;
        }

        fetch("/api/profile/completed-orders/", {
            method: "GET",
            headers: {
                "Authorization": `Token ${token}`,
                "Content-Type": "application/json",
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("There was a problem in retrieving order information..");
                }
                return response.json();
            })
            .then((orders) => {
                displayCompletedOrders(orders);
            })
            .catch((error) => {
                console.error("Error fetching completed orders:", error);
                completedOrdersSection.innerHTML = "<p>Error receiving orders. Please try again.</p>";
            });
    }

    // show completed orders
    function displayCompletedOrders(orders) {
        const completedOrdersSection = document.getElementById("completed-orders");
        const ordersContainer = document.createElement("ul");
        ordersContainer.className = "orders-list list-group mt-3";

        if (orders.length === 0) {
            ordersContainer.innerHTML = "<li class='list-group-item'>No order found.</li>";
        } else {
            orders.forEach((order) => {
                const orderItem = document.createElement("li");
                orderItem.className = "list-group-item";
                let foodsSection = '';

                // show existed foods in this order with their ratings.
                order.items.forEach(item => {
                    const food = item.food;
                    const foodRating = item.food_rating  // get the food rate
                    console.log(foodRating)
                    let foodRatingSection = '';
                    if (foodRating !== undefined && foodRating !== null) {
                        foodRatingSection = `<div><strong>You have already rated this food:</strong> ${food.name}: ${foodRating} from 5</div>`;
                    } else {
                        foodRatingSection = `
                            <div>
                                <strong>food:</strong> ${food.name} <br>
                                <a href="/orders/${order.id}/rate/" class="btn btn-sm btn-rate mt-2">register rate</a>
                            </div>
                        `;
                    }

                    foodsSection += `
                        <div>
                            ${foodRatingSection}
                        </div>
                        <hr>
                    `;
                });

                orderItem.innerHTML = `
                    <div>
                        <strong>order number:</strong> ${order.id} <br>
                        <strong>date:</strong> ${new Date(order.created_at).toLocaleDateString("fa-IR")} <br>
                        <strong>status:</strong> ${order.status} <br>
                        <strong>total price:</strong> ${order.total_price} $ <br>
                        ${foodsSection} <!-- show foods and their rates -->
                    </div>
                `;
                ordersContainer.appendChild(orderItem);
            });
        }

        completedOrdersSection.appendChild(ordersContainer);
    }
});
