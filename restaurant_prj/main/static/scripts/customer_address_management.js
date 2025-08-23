document.addEventListener('DOMContentLoaded', function () {
    const addAddressButton = document.getElementById('add-address-btn');
    const addressFormContainer = document.getElementById('address-form-container');
    const addressesList = document.getElementById('addresses-list');
    const addressForm = document.getElementById('address-form');
    const titleInput = document.getElementById('title');
    const addressInput = document.getElementById('address');
    const detailsInput = document.getElementById('details');
    const postalCodeInput = document.getElementById('postal_code');
    const addressIdInput = document.getElementById('address-id');
    const cancelBtn = document.getElementById('cancel-btn');

    const tabLinks = document.querySelectorAll('.tab-link');
    const contentSections = document.querySelectorAll('.content-section');
    const ACTIVE_TAB_KEY = 'activeTab';
    const FORM_VISIBILITY_KEY = 'formVisible';

    // show active tab
    function showTab(tabId) {
        contentSections.forEach(section => {
            section.style.display = section.id === tabId ? 'block' : 'none';
        });

        tabLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-target') === tabId);
        });

        // save active tab in localStorage
        localStorage.setItem(ACTIVE_TAB_KEY, tabId);
    }

    // save clicks on tab links
    tabLinks.forEach(link => {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            const target = link.getAttribute('data-target');
            showTab(target);
        });
    });

    // retrieving active tab from localStorage or show default tab
    const savedTab = localStorage.getItem(ACTIVE_TAB_KEY);
    const defaultTab = tabLinks[0]?.getAttribute('data-target'); // اولین تب به عنوان پیش‌فرض
    showTab(savedTab || defaultTab);

    // show or hide address form
    function toggleAddressForm(show) {
        addressFormContainer.style.display = show ? 'block' : 'none';
        addressesList.style.display = show ? 'none' : 'block';
        localStorage.setItem(FORM_VISIBILITY_KEY, show ? 'true' : 'false');

        // Hide or show the "Add New Address" and "Registered Addresses" buttons
        const savedAddressesSection = document.getElementById('saved-addresses');
        const h2 = savedAddressesSection.querySelector('h2');
        const addButton = savedAddressesSection.querySelector('#add-address-btn');

        if (show) {
            h2.style.display = 'none';
            addButton.style.display = 'none';
        } else {
            h2.style.display = 'block';
            addButton.style.display = 'block';
        }
    }

    // add new address button
    addAddressButton.addEventListener('click', function () {
        toggleAddressForm(true);
        document.getElementById('form-title').textContent = 'add new address';

        // Clear stored form data when adding new address
        localStorage.removeItem('addressFormData');

        // Clear all form fields to make them empty
        titleInput.value = '';
        addressInput.value = '';
        detailsInput.value = '';
        postalCodeInput.value = '';
        addressIdInput.value = '';
    });

    // cancel btn
    cancelBtn.addEventListener('click', function () {
        toggleAddressForm(false);
        // deleting form's data
        localStorage.removeItem('addressFormData');
    });

    // retrieving form status from localStorage
    const isFormVisible = localStorage.getItem(FORM_VISIBILITY_KEY) === 'true';
    toggleAddressForm(isFormVisible);

    // retrieving form datas from localStorage
    const savedFormData = JSON.parse(localStorage.getItem('addressFormData'));
    if (savedFormData) {
        titleInput.value = savedFormData.title || '';
        addressInput.value = savedFormData.address || '';
        detailsInput.value = savedFormData.details || '';
        postalCodeInput.value = savedFormData.postal_code || '';
        addressIdInput.value = savedFormData.id || '';
        document.getElementById('form-title').textContent = savedFormData.id ? 'edit address' : 'add new address';
        toggleAddressForm(true);
    }

    // edit address function
    window.editAddress = function (addressId) {
        const token = localStorage.getItem('token');

        fetch(`/api/addresses/${addressId}/`, {
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
            }
        })
            .then(response => response.json())
            .then(address => {
                // filling form with selected address to edit
                titleInput.value = address.title || '';
                addressInput.value = address.address || '';
                detailsInput.value = address.details || '';
                postalCodeInput.value = address.postal_code || '';
                addressIdInput.value = addressId;

                // Save form data in localStorage to persist after refresh
                localStorage.setItem('addressFormData', JSON.stringify({
                    title: address.title,
                    address: address.address,
                    details: address.details,
                    postal_code: address.postal_code,
                    id: addressId
                }));

                document.getElementById('form-title').textContent = 'edit address';
                toggleAddressForm(true); // show form
            })
            .catch(error => console.error('Error fetching address details:', error));
    };

    // Fetch addresses
    function fetchAddresses() {
        const token = localStorage.getItem('token');

        fetch('/api/addresses/', {
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
            }
        })
            .then(response => response.json())
            .then(data => {
                addressesList.innerHTML = ''; // Clear previous list
                if (Array.isArray(data)) {
                    data.forEach(address => {
                        const listItem = document.createElement('li');
                        listItem.classList.add('list-group-item');
                        listItem.innerHTML = `
                            <strong>${address.title || 'without title'}</strong><br>
                            ${address.address} - ${address.details} <br>
                            ${address.postal_code ? 'postal code: ' + address.postal_code : ''}
                            <button class="btn btn-warning btn-sm float-end mx-2" onclick="editAddress(${address.id})">edit</button>
                            <button class="btn btn-danger btn-sm float-end mx-2" onclick="deleteAddress(${address.id})">delete</button>
                        `;
                        addressesList.appendChild(listItem);
                    });
                } else {
                    console.error('Unexpected data format:', data);
                }
            })
            .catch(error => console.error('Error fetching addresses:', error));
    }

    // Add new address or update existing one
    addressForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const newAddress = {
            title: titleInput.value,
            address: addressInput.value,
            details: detailsInput.value,
            postal_code: postalCodeInput.value
        };

        const token = localStorage.getItem('token');
        const addressId = addressIdInput.value;

        if (addressId) {
            // Edit address
            fetch(`/api/addresses/${addressId}/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newAddress)
            })
                .then(response => response.json())
                .then(() => {
                    fetchAddresses(); // Refresh the list of addresses
                    toggleAddressForm(false); // Hide form
                    localStorage.removeItem('addressFormData'); // Clear form data after submission
                })
                .catch(error => console.error('Error editing address:', error));

        } else {
            // Add new address
            fetch('/api/add-address/', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newAddress)
            })
                .then(response => response.json())
                .then(() => {
                    fetchAddresses(); // Refresh the list of addresses
                    toggleAddressForm(false); // Hide form
                    localStorage.removeItem('addressFormData'); // Clear form data after submission
                })
                .catch(error => console.error('Error adding address:', error));
        }
    });

    // Delete address (moved outside)
    window.deleteAddress = function(addressId) {
        const token = localStorage.getItem('token');

        if (confirm('Are you sure about deleting this address?')) {
            fetch(`/api/delete-address/${addressId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                }
            })
                .then(response => response.json())
                .then(() => {
                    fetchAddresses(); // Refresh the list of addresses after deletion
                })
                .catch(error => console.error('Error deleting address:', error));
        }
    }

    // Initial fetch of addresses
    fetchAddresses();
});
