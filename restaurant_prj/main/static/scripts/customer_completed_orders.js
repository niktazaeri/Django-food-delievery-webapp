document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please log in first.');
        window.location.href = '/login/';
        return;
    }

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

        // اگر تب سفارشات تکمیل شده باشد، اطلاعات آن را دریافت کن
        if (tabId === 'completed-orders') {
            fetchCompletedOrders();
        }
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

    // دریافت لیست سفارشات تکمیل شده از API
    function fetchCompletedOrders() {
        const completedOrdersSection = document.getElementById("completed-orders");
        const ordersContainer = completedOrdersSection.querySelector(".orders-list");

        // اگر لیست قبلاً پر شده باشد، دوباره درخواست ارسال نمی‌کنیم
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
                    throw new Error("مشکلی در دریافت اطلاعات سفارشات رخ داده است.");
                }
                return response.json();
            })
            .then((orders) => {
                displayCompletedOrders(orders);
            })
            .catch((error) => {
                console.error("Error fetching completed orders:", error);
                completedOrdersSection.innerHTML = "<p>خطا در دریافت سفارشات. لطفاً دوباره تلاش کنید.</p>";
            });
    }

    // نمایش سفارشات تکمیل شده
    function displayCompletedOrders(orders) {
        const completedOrdersSection = document.getElementById("completed-orders");
        const ordersContainer = document.createElement("ul");
        ordersContainer.className = "orders-list list-group mt-3";

        if (orders.length === 0) {
            ordersContainer.innerHTML = "<li class='list-group-item'>هیچ سفارشی یافت نشد.</li>";
        } else {
            orders.forEach((order) => {
                const orderItem = document.createElement("li");
                orderItem.className = "list-group-item";
                let foodsSection = '';

                // نمایش غذاهای موجود در این سفارش به همراه امتیاز ثبت‌شده
                order.items.forEach(item => {
                    const food = item.food;
                    const foodRating = item.food_rating  // امتیاز غذا را از food_rating دریافت می‌کنیم
                    console.log(foodRating)
                    let foodRatingSection = '';
                    if (foodRating !== undefined && foodRating !== null) {
                        foodRatingSection = `<div><strong>شما قبلاً به این غذا امتیاز داده‌اید:</strong> ${food.name}: ${foodRating} از 5</div>`;
                    } else {
                        foodRatingSection = `
                            <div>
                                <strong>غذا:</strong> ${food.name} <br>
                                <a href="/orders/${order.id}/rate/" class="btn btn-sm btn-rate mt-2">ثبت امتیاز</a>
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
                        <strong>شماره سفارش:</strong> ${order.id} <br>
                        <strong>تاریخ:</strong> ${new Date(order.created_at).toLocaleDateString("fa-IR")} <br>
                        <strong>وضعیت:</strong> ${order.status} <br>
                        <strong>مجموع مبلغ:</strong> ${order.total_price} تومان <br>
                        ${foodsSection} <!-- نمایش غذاها و امتیاز آنها -->
                    </div>
                `;
                ordersContainer.appendChild(orderItem);
            });
        }

        completedOrdersSection.appendChild(ordersContainer);
    }
});
