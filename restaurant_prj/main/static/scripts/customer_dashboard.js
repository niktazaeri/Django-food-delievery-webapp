// document.addEventListener("DOMContentLoaded", () => {
//     const token = localStorage.getItem('token');
//     let currentPage = 1;  // شروع از صفحه اول
//
//     // Fetch top ten foods (پرفروش‌ترین‌ها)
//     const fetchTopTenFoods = () => {
//         if (!token) {
//             console.error("Authentication token is missing.");
//             alert("You need to log in first.");
//             window.location.href = "/login"; // Redirect to login page if token is missing
//             return Promise.reject("Token is missing");
//         }
//
//         return fetch("/api/top-ten-foods/", {
//             headers: {
//                 'Authorization': `Token ${token}`,
//             }
//         })
//             .then(response => {
//                 if (!response.ok) {
//                     throw new Error("Failed to fetch top ten foods");
//                 }
//                 return response.json();
//             })
//             .catch(error => {
//                 console.error("Error fetching top ten foods:", error);
//                 alert("Failed to load top ten foods. Please try again later.");
//             });
//     };
//
//     // Fetch foods with pagination
//     const fetchFoods = (page = 1) => {
//         if (!token) {
//             console.error("Authentication token is missing.");
//             alert("You need to log in first.");
//             window.location.href = "/login"; // Redirect to login page if token is missing
//             return Promise.reject("Token is missing");
//         }
//
//         return fetch(`/api/foods/?page=${page}`, {
//             headers: {
//                 'Authorization': `Token ${token}`,
//             }
//         })
//             .then(response => {
//                 if (!response.ok) {
//                     throw new Error("Failed to fetch foods");
//                 }
//                 return response.json();
//             })
//             .catch(error => {
//                 console.error("Error fetching foods:", error);
//                 alert("Failed to load foods. Please try again later.");
//             });
//     };
//
//     // Render foods on the page
//     const renderFoods = (foods, containerId) => {
//         const container = document.getElementById(containerId);
//         container.innerHTML = ""; // Clear previous content
//         console.log("Fetched foods data:", foods); // Log the fetched data for debugging
//         if (Array.isArray(foods)) {
//             foods.forEach(food => {
//                 const foodItem = document.createElement("div");
//                 foodItem.className = "food-item";
//                 foodItem.innerHTML = `
//                     <img src="${food.image || '/static/default-ui-image-placeholder-wireframes-600nw-1037719192.webp'}" alt="${food.name}">
//                     <div>
//                         <h3>${food.name}</h3>
//                         <p>قیمت: ${food.price} تومان </p>
//                         <p>امتیاز: ${food.average_rating}</p>
//                         <p>دسته بندی: ${food.category}</p>
//                         <button class="add-to-cart-button" data-food-id="${food.id}">افزودن به سبد خرید</button>
//                     </div>
//                 `;
//                 container.appendChild(foodItem);
//             });
//         } else {
//             console.error("Expected an array but got:", foods);
//         }
//     };
//
//     // Load data function using pagination
//     const loadData = (page) => {
//         fetchFoods(page)
//             .then(data => {
//                 console.log("Foods data:", data); // Log foods data to inspect the structure
//                 renderFoods(data.results, "food-list-container"); // Render foods from results array
//                 renderPagination(data.count, page); // Show pagination controls
//                 handleFilter(data.results); // Handle filter after the foods are loaded
//             })
//             .catch(error => {
//                 console.error("Error loading data:", error);
//                 alert("Error loading data. Please try again later.");
//             });
//     };
//
//     // Render pagination buttons with page numbers
//     const renderPagination = (totalItems, currentPage) => {
//         const paginationContainer = document.getElementById("pagination-container");
//         paginationContainer.innerHTML = "";  // Clear previous pagination buttons
//         const totalPages = Math.ceil(totalItems / 8);  // تعداد صفحات
//
//         // Previous button
//         if (currentPage > 1) {
//             const prevButton = document.createElement("button");
//             prevButton.textContent = "قبلی";
//             prevButton.addEventListener("click", () => loadData(currentPage - 1));
//             paginationContainer.appendChild(prevButton);
//         }
//
//         // Page number buttons
//         for (let i = 1; i <= totalPages; i++) {
//             const pageButton = document.createElement("button");
//             pageButton.textContent = i;
//             pageButton.classList.add("page-button");
//             if (i === currentPage) {
//                 pageButton.classList.add("active");
//             }
//             pageButton.addEventListener("click", () => loadData(i));
//             paginationContainer.appendChild(pageButton);
//         }
//
//         // Next button
//         if (currentPage < totalPages) {
//             const nextButton = document.createElement("button");
//             nextButton.textContent = "بعدی";
//             nextButton.addEventListener("click", () => loadData(currentPage + 1));
//             paginationContainer.appendChild(nextButton);
//         }
//     };
//
//     // Filter handler
//     const handleFilter = (foods) => {
//         const filterSelect = document.getElementById("category-filter");
//         filterSelect.addEventListener("change", () => {
//             const selectedCategory = filterSelect.value;
//             const filteredFoods = selectedCategory === "all"
//                 ? foods
//                 : foods.filter(food => food.category === selectedCategory);
//             renderFoods(filteredFoods, "food-list-container");
//         });
//     };
//
//     // Load data function for top ten foods
//     const loadTopTenFoods = () => {
//         fetchTopTenFoods()
//             .then(topTenFoods => {
//                 console.log("Top ten foods data:", topTenFoods); // Log top ten foods data
//                 renderTopTenFoods(topTenFoods); // Render top ten foods
//             })
//             .catch(error => {
//                 console.error("Error loading top ten foods:", error);
//                 alert("Error loading top ten foods. Please try again later.");
//             });
//     };
//
//     // Render top ten foods
//     const renderTopTenFoods = (foods) => {
//         const container = document.getElementById("top-ten-container");
//         container.innerHTML = ""; // Clear previous content
//         foods.forEach(food => {
//             const foodItem = document.createElement("div");
//             foodItem.className = "food-item";
//             foodItem.innerHTML = `
//                 <img src="${food.image || '/static/default-ui-image-placeholder-wireframes-600nw-1037719192.webp'}" alt="${food.name}">
//                 <div>
//                     <h3>${food.name}</h3>
//                     <p>قیمت: ${food.price} تومان</p>
//                     <p>امتیاز: ${food.average_rating}</p>
//                     <p>دسته بندی: ${food.category}</p>
//                     <button class="add-to-cart-button" data-food-id="${food.id}">افزودن به سبد خرید</button>
//                 </div>
//             `;
//             container.appendChild(foodItem);
//         });
//     };
//
//     // Initial load of data
//     loadTopTenFoods(); // Load top ten foods first
//     loadData(currentPage); // Then load paginated foods
// });
//--------------------------------------------------------------------------------------------------------------------
// document.addEventListener("DOMContentLoaded", () => {
//     const token = localStorage.getItem('token');
//     let currentPage = 1;  // start from page 1
//
//     // Fetch foods with pagination and category filter
//     const fetchFoods = (page = 1, category = "all") => {
//         if (!token) {
//             console.error("Authentication token is missing.");
//             alert("You need to log in first.");
//             window.location.href = "/login"; // Redirect to login page if token is missing
//             return Promise.reject("Token is missing");
//         }
//
//         return fetch(`/api/foods/?page=${page}&category=${category}`, {
//             headers: {
//                 'Authorization': `Token ${token}`,
//             }
//         })
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error("Failed to fetch foods");
//             }
//             return response.json();
//         })
//         .catch(error => {
//             console.error("Error fetching foods:", error);
//             alert("Failed to load foods. Please try again later.");
//         });
//     };
//
//     // Render foods on the page
//     const renderFoods = (foods, containerId) => {
//         const container = document.getElementById(containerId);
//         container.innerHTML = ""; // Clear previous content
//         if (Array.isArray(foods)) {
//             foods.forEach(food => {
//                 const foodItem = document.createElement("div");
//                 foodItem.className = "food-item";
//                 foodItem.innerHTML = `
//                     <img src="${food.image || '/static/default-ui-image-placeholder-wireframes-600nw-1037719192.webp'}" alt="${food.name}">
//                     <div>
//                         <h3>${food.name}</h3>
//                         <p>قیمت: ${food.price} تومان </p>
//                         <p>امتیاز: ${food.average_rating}</p>
//                         <p>دسته بندی: ${food.category}</p>
//                         <button class="add-to-cart-button" data-food-id="${food.id}">افزودن به سبد خرید</button>
//                     </div>
//                 `;
//                 container.appendChild(foodItem);
//             });
//         } else {
//             console.error("Expected an array but got:", foods);
//         }
//     };
//
//     // Load data function using pagination
//     const loadData = (page, category) => {
//         fetchFoods(page, category)
//             .then(data => {
//                 renderFoods(data.results, "food-list-container"); // Render foods from results array
//                 renderPagination(data.count, page, category); // Show pagination controls
//             })
//             .catch(error => {
//                 console.error("Error loading data:", error);
//                 alert("Error loading data. Please try again later.");
//             });
//     };
//
//     // Render pagination buttons with page numbers
//     const renderPagination = (totalItems, currentPage, category) => {
//         const paginationContainer = document.getElementById("pagination-container");
//         paginationContainer.innerHTML = "";  // Clear previous pagination buttons
//         const totalPages = Math.ceil(totalItems / 8);  // Total pages
//
//         // Previous button
//         if (currentPage > 1) {
//             const prevButton = document.createElement("button");
//             prevButton.textContent = "قبلی";
//             prevButton.addEventListener("click", () => loadData(currentPage - 1, category));
//             paginationContainer.appendChild(prevButton);
//         }
//
//         // Page number buttons
//         for (let i = 1; i <= totalPages; i++) {
//             const pageButton = document.createElement("button");
//             pageButton.textContent = i;
//             pageButton.classList.add("page-button");
//             if (i === currentPage) {
//                 pageButton.classList.add("active");
//             }
//             pageButton.addEventListener("click", () => loadData(i, category));
//             paginationContainer.appendChild(pageButton);
//         }
//
//         // Next button
//         if (currentPage < totalPages) {
//             const nextButton = document.createElement("button");
//             nextButton.textContent = "بعدی";
//             nextButton.addEventListener("click", () => loadData(currentPage + 1, category));
//             paginationContainer.appendChild(nextButton);
//         }
//     };
//
//     // Filter handler with buttons
//     const handleFilter = () => {
//         const filterButtons = document.querySelectorAll(".filter-button");
//         filterButtons.forEach(button => {
//             button.addEventListener("click", () => {
//                 const selectedCategory = button.getAttribute("data-category");
//                 loadData(1, selectedCategory); // Reload data with selected category and reset to page 1
//             });
//         });
//     };
//
//     // Initial load of data
//     loadData(currentPage, "all"); // Load all foods initially
//
//     // Initialize the filter
//     handleFilter();
// });
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem('token');
    let currentPage = 1;  // start from page 1

    // Fetch foods with pagination and category filter
    const fetchFoods = (page = 1, category = "all") => {
        if (!token) {
            console.error("Authentication token is missing.");
            alert("You need to log in first.");
            window.location.href = "/login"; // Redirect to login page if token is missing
            return Promise.reject("Token is missing");
        }

        // Change the URL to the new API path 'foods-filter/'
        return fetch(`/api/foods-filter/?page=${page}&category=${category}`, {
            headers: {
                'Authorization': `Token ${token}`,
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch foods");
            }
            return response.json();
        })
        .catch(error => {
            console.error("Error fetching foods:", error);
            alert("Failed to load foods. Please try again later.");
        });
    };

    // Render foods on the page
    const renderFoods = (foods, containerId) => {
        const container = document.getElementById(containerId);
        container.innerHTML = ""; // Clear previous content
        if (Array.isArray(foods)) {
            foods.forEach(food => {
                const foodItem = document.createElement("div");
                foodItem.className = "food-item";
                foodItem.innerHTML = `
                    <img src="${food.image || '/static/default-ui-image-placeholder-wireframes-600nw-1037719192.webp'}" alt="${food.name}">
                    <div>
                        <h3>${food.name}</h3>
                        <p>قیمت: ${food.price} تومان </p>
                        <p>امتیاز: ${food.average_rating}</p>
                        <p>دسته بندی: ${food.category}</p>
                        <button class="add-to-cart-button" data-food-id="${food.id}">افزودن به سبد خرید</button>
                    </div>
                `;
                container.appendChild(foodItem);
            });
        } else {
            console.error("Expected an array but got:", foods);
        }
    };

    // Load data function using pagination
    const loadData = (page, category) => {
        fetchFoods(page, category)
            .then(data => {
                renderFoods(data.results, "food-list-container"); // Render foods from results array
                renderPagination(data.count, page, category); // Show pagination controls
            })
            .catch(error => {
                console.error("Error loading data:", error);
                alert("Error loading data. Please try again later.");
            });
    };

    // Render pagination buttons with page numbers
    const renderPagination = (totalItems, currentPage, category) => {
        const paginationContainer = document.getElementById("pagination-container");
        paginationContainer.innerHTML = "";  // Clear previous pagination buttons
        const totalPages = Math.ceil(totalItems / 8);  // Total pages

        // Previous button
        if (currentPage > 1) {
            const prevButton = document.createElement("button");
            prevButton.textContent = "قبلی";
            prevButton.addEventListener("click", () => loadData(currentPage - 1, category));
            paginationContainer.appendChild(prevButton);
        }

        // Page number buttons
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement("button");
            pageButton.textContent = i;
            pageButton.classList.add("page-button");
            if (i === currentPage) {
                pageButton.classList.add("active");
            }
            pageButton.addEventListener("click", () => loadData(i, category));
            paginationContainer.appendChild(pageButton);
        }

        // Next button
        if (currentPage < totalPages) {
            const nextButton = document.createElement("button");
            nextButton.textContent = "بعدی";
            nextButton.addEventListener("click", () => loadData(currentPage + 1, category));
            paginationContainer.appendChild(nextButton);
        }
    };

    // Filter handler with buttons
    const handleFilter = () => {
        const filterButtons = document.querySelectorAll(".filter-button");
        filterButtons.forEach(button => {
            button.addEventListener("click", () => {
                const selectedCategory = button.getAttribute("data-category");
                loadData(1, selectedCategory); // Reload data with selected category and reset to page 1
            });
        });
    };

    // Fetch top ten foods (پرفروش‌ترین‌ها)
    const fetchTopTenFoods = () => {
        if (!token) {
            console.error("Authentication token is missing.");
            alert("You need to log in first.");
            window.location.href = "/login"; // Redirect to login page if token is missing
            return Promise.reject("Token is missing");
        }

        return fetch("/api/top-ten-foods/", {
            headers: {
                'Authorization': `Token ${token}`,
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to fetch top ten foods");
                }
                return response.json();
            })
            .catch(error => {
                console.error("Error fetching top ten foods:", error);
                alert("Failed to load top ten foods. Please try again later.");
            });
    };

     // Load data function for top ten foods
    const loadTopTenFoods = () => {
        fetchTopTenFoods()
            .then(topTenFoods => {
                console.log("Top ten foods data:", topTenFoods); // Log top ten foods data
                renderTopTenFoods(topTenFoods); // Render top ten foods
            })
            .catch(error => {
                console.error("Error loading top ten foods:", error);
                alert("Error loading top ten foods. Please try again later.");
            });
    };

    // Render top ten foods
    const renderTopTenFoods = (foods) => {
        const container = document.getElementById("top-ten-container");
        container.innerHTML = ""; // Clear previous content
        foods.forEach(food => {
            const foodItem = document.createElement("div");
            foodItem.className = "food-item";
            foodItem.innerHTML = `
                <img src="${food.image || '/static/default-ui-image-placeholder-wireframes-600nw-1037719192.webp'}" alt="${food.name}">
                <div>
                    <h3>${food.name}</h3>
                    <p>قیمت: ${food.price} تومان</p>
                    <p>امتیاز: ${food.average_rating}</p>
                    <p>دسته بندی: ${food.category}</p>
                    <button class="add-to-cart-button" data-food-id="${food.id}">افزودن به سبد خرید</button>
                </div>
            `;
            container.appendChild(foodItem);
        });
    };

    // Initial load of data
    loadTopTenFoods(); // Load top ten foods first

    // Initial load of data
    loadData(currentPage, "all"); // Load all foods initially

    // Initialize the filter
    handleFilter();
});

