document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem('token');
    const addressesContainer = document.getElementById('addresses-container');
    const confirmOrderButton = document.getElementById('confirm-order-button');
    const backButton = document.getElementById('back-button');

    if (!token) {
        alert('Please login to your account first.');
        window.location.href = '/login/';
        return;
    }

    // load addresses
    fetch('/api/addresses/', {
        method: 'GET',
        headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.length === 0) {
            addressesContainer.innerHTML = '<p>You have not saved any addresses.</p>';
            return;
        }

        // show addresses
        data.forEach(address => {
            const addressElement = document.createElement('div');
            addressElement.className = 'address-item';

            // Check that the address title is not null and if it is null, set the text "No title"
            const title = address.title ? address.title : 'No title';

            addressElement.innerHTML = `
                <input type="radio" name="address" value="${address.id}" id="address-${address.id}">
                <label for="address-${address.id}">
                    ${title} - ${address.address} - ${address.details} - ${address.postal_code}
                </label>
            `;

            // Mark selected address
            if (localStorage.getItem('selectedAddressId') === address.id.toString()) {
                addressElement.querySelector('input').checked = true;
            }
            addressesContainer.appendChild(addressElement);
        });
    })
    .catch(error => {
        console.error('Error loading addresses:', error);
        alert('Error loading addresses.');
    });

    // confirm order
    confirmOrderButton.addEventListener('click', function () {
        const selectedAddressId = document.querySelector('input[name="address"]:checked')?.value;

        if (!selectedAddressId) {
            alert('Please choose an address.');
            return;
        }

        // Save the selected address to localStorage
        localStorage.setItem('selectedAddressId', selectedAddressId);

        // redirect to order pre-view page
        window.location.href = '/order-preview/';
    });

    // back btn
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = '/cart/'; // back to cart page
        });
    }
});
