document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem('token');
    const selectedAddressId = localStorage.getItem('selectedAddressId');

    if (!token) {
        alert('Please login to your account first.');
        window.location.href = '/login/';
        return;
    }

    if (!selectedAddressId) {
        alert('Please choose your address.');
        window.location.href = '/select-address/';
        return;
    }

    fetch('/api/order-preview/', {
        method: 'POST',
        headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address_id: selectedAddressId }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert(data.message);
            return;
        }

        const addressTitle = data.address.title || 'without title';
        const addressAddress = data.address.address;
        const addressDetails = data.address.details ;

        document.getElementById('address-title').innerText = addressTitle;
        document.getElementById('address-address').innerText = addressAddress;
        document.getElementById('address-details').innerText = addressDetails;

        const itemsContainer = document.getElementById('order-items');
        itemsContainer.innerHTML = data.items.map(item => `
            <div class="item">
                <p>food: ${item.food.name}</p>
                <p>price: ${item.food.price} $</p>
                <p>quantity: ${item.quantity}</p>
                <p>total price: ${item.total_price} $</p>
            </div>
        `).join('');

        let totalPrice = data.total_price;
        document.getElementById('total-price').innerText = `${totalPrice} $`;

        const discountFieldHTML = `
            <div class="discount">
                <h3>discount code:</h3>
                <input type="text" id="coupon-code" placeholder="Enter your discount code">
                <button id="apply-coupon">apply discount</button>
                <p id="discount-info"></p>
            </div>
        `;
        document.querySelector('.buttons').insertAdjacentHTML('beforebegin', discountFieldHTML);

        document.getElementById('apply-coupon').addEventListener('click', function () {
            const couponCode = document.getElementById('coupon-code').value;

            if (!couponCode) {
                alert('Please enter your discount code.');
                return;
            }

            fetch('/api/apply-coupon/', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ coupon_code: couponCode }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.discounted_price) {
                    document.getElementById('discount-info').innerHTML = `
                        Before discount: ${data.original_price} $ | 
                        OFF: ${data.discount}% | 
                        Price after discount: ${data.discounted_price} $
                    `;
                    document.getElementById('total-price').innerText = `${data.discounted_price} $`;
                } else {
                    alert(data.message || 'Error in discount application');
                }
            });
        });

        document.getElementById('back-to-address').addEventListener('click', () => {
            window.location.href = '/select-address/';
        });

        document.getElementById('submit-order').addEventListener('click', () => {
            const couponCode = document.getElementById('coupon-code').value;
            submitOrder(selectedAddressId, couponCode);
        });
    })
    .catch(error => {
        console.error('Error loading order preview:', error);
        alert('Error while loading order pre-view.');
    });

    const submitOrder = (addressId, couponCode) => {
        fetch('/api/place-order/', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ address_id: addressId, coupon_code: couponCode }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Your order has been registered!');
                window.location.href = `/checkout/${data.order_id}/`;
            } else {
                alert('Error in order registration.');
            }
        })
        .catch(error => {
            console.error('Error submitting order:', error);
            alert('Error in order registration.');
        });
    };
});
