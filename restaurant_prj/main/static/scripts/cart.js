document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login to your account first.');
        window.location.href = '/login/';
        return;
    }

    // adding food to cart
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
                alert(data.message || 'added to cart!');
                reloadCartItems();
                updateCartIcon();
            })
            .catch((error) => {
                console.error('Error adding to cart:', error);
                alert('error in adding to cart.');
            });
    };

    // delete an item from cart
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
                alert(data.message || 'item has been deleted.');
                reloadCartItems();
                updateCartIcon();
            })
            .catch((error) => {
                console.error('Error deleting cart item:', error);
                alert('error occured during deleting item from cart.');
            });
    };

    // updating cart items
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
                alert('error occured during updating items in cart.');
            });
    };

    // loading cart items
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

            // if cart is empty
            if (!data || data.length === 0) {
                cartContainer.innerHTML = '<p>Your cart is empty.</p>';
                // deleting order button if cart is empty
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
                        <p>name: ${item.food.name}</p>
                        <p>price: ${item.food.price} $</p>
                        <p>quantity: <span class="quantity">${item.quantity}</span></p>
                        <p>total price: <span class="total-price">${item.total_price}</span></p>
                    </div>
                    <div class="cart-item-actions">
                        <button class="increase-quantity" data-item-id="${item.id}">+</button>
                        <button class="decrease-quantity" data-item-id="${item.id}">-</button>
                        <button class="delete-item" data-item-id="${item.id}">delete</button>
                    </div>
                `;
                totalPrice += item.total_price;
                cartContainer.appendChild(cartItem);
            });

            // showing total price management
            const totalPriceContainer = document.getElementById('total-price-container');
            if (!totalPriceContainer) {
                const newTotalPriceContainer = document.createElement('div');
                newTotalPriceContainer.id = 'total-price-container';
                newTotalPriceContainer.className = 'total-price-container';
                newTotalPriceContainer.innerHTML = `
                    <p>final total price: <span id="final-price">${totalPrice} $</span></p>
                `;
                cartContainer.appendChild(newTotalPriceContainer);
            } else {
                const finalPriceElement = totalPriceContainer.querySelector('#final-price');
                finalPriceElement.textContent = `${totalPrice} $`;
            }

            // checking and adding checkout button if it has not been added before
        const buttonsContainer = document.getElementById('buttons-container');
        if (!document.getElementById('checkout-button')) {
            const checkoutButton = document.createElement('button');
            checkoutButton.id = 'checkout-button';
            checkoutButton.className = 'btn mt-4';
            checkoutButton.textContent = 'order registration';
            buttonsContainer.appendChild(checkoutButton);

            // order registration eventlistener
            checkoutButton.addEventListener('click', function () {
                window.location.href = '/select-address/';
            });
        }
        })
        .catch((error) => {
            console.error('Error loading cart items:', error);
            alert('error occured during loading cart items.');
        });
};


    // updating cart items quantity in cart icon
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

    // clicking on buttons management
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

    // back button
    document.getElementById('back-button').addEventListener('click', function () {
        window.location.href = '/customer-dashboard/'; // back to previous page

    });

    // load datas
    reloadCartItems();
    updateCartIcon();
});
