document.addEventListener("DOMContentLoaded", function() {
     const token = localStorage.getItem('token');
    console.log(token);

    if (!token) {
        alert('Please login to your account first.');
        window.location.href = '/login/';
        return;
    }
    // Get best-selling food data from the API
    fetchTopSellingFoods();
});

function fetchTopSellingFoods() {
    fetch('/api/top-ten-foods/')
        .then(response => response.json())
        .then(data => {
            displayTopSellingFoods(data);
        })
        .catch(error => {
            console.error('Error fetching top selling foods:', error);
        });
}

// Function to display best-selling foods
function displayTopSellingFoods(foods) {
    const foodListContainer = document.getElementById('TopFoodList');
    foodListContainer.innerHTML = '';

    if (foods.length === 0) {
        foodListContainer.innerHTML = '<p>No top-selling foods available.</p>';
        return;
    }

    foods.forEach(food => {
        const foodCard = createFoodCard(food);
        foodListContainer.appendChild(foodCard);
    });
}

function createFoodCard(food) {
    const foodCard = document.createElement('div');
    foodCard.classList.add('col-md-4', 'mb-4');

    foodCard.innerHTML = `
        <div class="card food-card">
            <img src="${food.image || '/static/images/default_food_image.jpg'}" class="card-img-top" alt="${food.name}">
            <div class="card-body">
                <h5 class="card-title">${food.name}</h5>
                <p class="card-text">Category: ${food.category}</p>
                <p class="card-text">Sales: ${food.sales_count}</p>
                <p class="card-text">Price: ${food.price} $</p>
            </div>
        </div>
    `;
    return foodCard;
}
