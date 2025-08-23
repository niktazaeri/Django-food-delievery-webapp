document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please log in first.');
        window.location.href = '/login/';
        return;
    }

    const foodListSection = document.getElementById("foodListSection");
    const foodFormSection = document.getElementById("foodFormSection");
    const foodInfoSection = document.getElementById("foodInfoSection");

    const createFoodBtn = document.getElementById("createFoodBtn");
    const cancelFoodForm = document.getElementById("cancelFoodForm");
    const foodForm = document.getElementById("foodForm");

    const foodList = document.getElementById("foodList");
    const foodDetails = document.getElementById("foodDetails");

    const backToManageFoods = document.getElementById("backToManageFoods");

    let foodId = null; // Save food ID in edit mode
    let currentPage = 1;
    let totalPages = 1;

    // Show the Manage Food Section
    function showFoodSection() {
        foodListSection.style.display = "block";
        foodFormSection.style.display = "none";
        foodInfoSection.style.display = "none";
        setActiveTabInCookie("foodListSection")
    }

    // Show the Create/Edit Food Form
    function showFoodForm(title) {
        document.getElementById("foodFormTitle").textContent = title;
        foodListSection.style.display = "none";
        foodFormSection.style.display = "block";
        foodInfoSection.style.display = "none";
        setActiveTabInCookie("foodFormSection")
    }

    // Show the Info Section
    function showFoodInfo(data) {
        foodDetails.innerHTML = `
            <strong>Name:</strong> ${data.name}<br>
            <strong>Price:</strong> ${data.price}<br>
            <strong>Category:</strong> ${data.category}<br>
            <strong>Description:</strong> ${data.description}<br>
            <strong>Code:</strong> ${data.code}<br>
            <img src="${data.image}" alt="${data.name}" class="img-fluid">
        `;
        foodInfoSection.style.display = "block";
        foodListSection.style.display = "none";
        foodFormSection.style.display = "none";

        setActiveTabInCookie("foodInfoSection")
    }

    // Load Food List
     // Load Food List with Pagination
    function loadFoods(page = 1) {
        fetch(`/api/foods/?page=${page}`)
            .then(response => response.json())
            .then(data => {
                foodList.innerHTML = '';
                data.results.forEach(food => {
                    const foodItem = document.createElement("div");
                    foodItem.className = "col-md-4";
                    foodItem.innerHTML = `
                        <div class="card food-card">
                            <img src="${food.image}" class="card-img-top" alt="${food.name}">
                            <div class="card-body">
                                <h5 class="card-title">${food.name}</h5>
                                <p class="card-text">${food.description}</p>
                                <p class="card-text"><strong>Category:</strong> ${food.category}</p>
                                <p class="card-text"><strong>Code:</strong> ${food.code}</p>
                                <p class="card-text"><strong>Price:</strong> ${food.price}</p>
                                <div>
                                    <button class="btn infobtn btn-sm me-2" onclick="viewFood(${food.id})">Info</button>
                                    <button class="btn btn-warning btn-sm me-2" onclick="editFood(${food.id})">Edit</button>
                                    <button class="btn btn-danger btn-sm" onclick="deleteFood(${food.id})">Delete</button>
                                </div>
                            </div>
                        </div>
                    `;
                    foodList.appendChild(foodItem);
                });
                totalPages = Math.ceil(data.count / 8);  // Assuming 8 items per page
                renderPagination(page);  // Render pagination buttons
            });
    }

    // Render Pagination
    function renderPagination(page) {
        const paginationContainer = document.getElementById("pagination");
        paginationContainer.innerHTML = ''; // Clear previous pagination buttons

        // Previous button
        if (page > 1) {
            const prevButton = document.createElement("button");
            prevButton.textContent = "previous";
            prevButton.classList.add("btn", "btn-prev", "me-2");
            prevButton.addEventListener("click", () => loadFoods(page - 1));
            paginationContainer.appendChild(prevButton);
        }

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement("button");
            pageButton.textContent = i;
            pageButton.classList.add("btn", "btn-light", "me-2");
            if (i === page) {
                pageButton.disabled = true;
                pageButton.classList.add("active");
            }
            pageButton.addEventListener("click", () => loadFoods(i));
            paginationContainer.appendChild(pageButton);
        }

        // Next button
        if (page < totalPages) {
            const nextButton = document.createElement("button");
            nextButton.textContent = "next";
            nextButton.classList.add("btn", "btn-next");
            nextButton.addEventListener("click", () => loadFoods(page + 1));
            paginationContainer.appendChild(nextButton);
        }
    }

    // Edit Food
    window.editFood = function (id) {
        fetch(`/api/edit-food/${id}/`)
            .then(response => {
                if (!response.ok) throw new Error("Failed to load food details");
                return response.json();
            })
            .then(data => {
                foodId = id; // Save food ID in edit mode
                document.getElementById("name").value = data.name;
                document.getElementById("category").value = data.category;
                document.getElementById("price").value = data.price;
                document.getElementById("code").value = data.code;
                document.getElementById("description").value = data.description;
                showFoodForm("Edit Food");
            })
            .catch(err => {
                console.error("Error:", err);
                alert("Failed to load food details.");
            });
    };

    //Delete Food
    window.deleteFood = function (id) {
        if (confirm("Are you sure you want to delete this food item?")) {
            fetch(`/api/delete-food/${id}/`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(err => {
                            throw new Error(JSON.stringify(err));
                        });
                    }
                    loadFoods(); // Refresh the food list after deletion
                    alert("Food deleted successfully!");
                })
                .catch(err => {
                    console.error("Error:", err);
                    alert(`Error: ${err.message}`);
                });
        }
    };

    // View Food Info
    window.viewFood = function (id) {
        fetch(`/api/foods/${id}/`)
            .then(response => response.json())
            .then(data => {
                // save information in localStorage
                localStorage.setItem('activeFoodId', id);
                localStorage.setItem('foodDetails', JSON.stringify(data));

                // show food datas
                showFoodInfo(data);
            })
            .catch(err => {
                console.error("Error:", err);
                alert("Failed to load food details.");
            });
    };

    //Handle Back to foods list btn
    backToManageFoods.addEventListener("click", () => {
        foodInfoSection.style.display = "none";
        showFoodSection();
    });

    // Handle Create Button Click
    createFoodBtn.addEventListener("click", () => {
        foodId = null; // Reset ID for creation mode
        foodForm.reset();
        showFoodForm("Create Food");
    });

    // Handle Cancel Form
    cancelFoodForm.addEventListener("click", showFoodSection);

    // Submit Food Form
    foodForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const formData = new FormData(); // Using FormData to submit data and files
        formData.append("name", document.getElementById("name").value);
        const imageFile = document.getElementById("image").files[0];
        if (imageFile) {
            formData.append("image", imageFile); // Only sent when the user has selected a file.
        }
        formData.append("category", document.getElementById("category").value);
        formData.append("price", document.getElementById("price").value);
        formData.append("description", document.getElementById("description").value);
        formData.append("code", document.getElementById("code").value);

        const url = foodId ? `/api/edit-food/${foodId}/` : '/api/add-food/';
        const method = foodId ? "PUT" : "POST";

        fetch(url, {
            method: method,
            body: formData, // send datas to server
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => {
                        throw new Error(JSON.stringify(err));
                    });
                }
                return response.json();
            })
            .then(() => {
                showFoodSection();
                loadFoods();
            })
            .catch(err => {
                console.error("Error:", err);
                alert(`Error: ${err.message}`);
            });
    });




    // Check and Load Food Info from Local Storage on Page Load
    const activeFoodId = localStorage.getItem('activeFoodId');
    const foodDetailsStored = localStorage.getItem('foodDetails');

    if (activeFoodId && foodDetailsStored && getActiveTabFromCookie() === "foodInfoSection") {
        const data = JSON.parse(foodDetailsStored);
        showFoodInfo(data); // show saved datas from Local Storage
    }

    // Load foods on page load
    loadFoods(currentPage);
});
