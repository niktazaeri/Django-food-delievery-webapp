document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("register-form");
    const addAddressButton = document.getElementById("add-address");
    const addressesSection = document.getElementById("addresses-section");
    const passwordInput = document.getElementById("password");
    const repeatPasswordInput = document.getElementById("repeat-password");
    const passwordError = document.getElementById("password-error");
    let addressCount = 1;

    // add new address
    addAddressButton.addEventListener("click", () => {
        addressCount++;
        const addressDiv = document.createElement("div");
        addressDiv.className = "address mb-3";
        addressDiv.innerHTML = `
            <label for="title-${addressCount}" class="form-label">title:</label>
            <input type="text" class="title-input form-control mb-2" name="title">
            <label for="address-${addressCount}" class="form-label">address:</label>
            <input type="text" class="address-input form-control mb-2" name="address" required>
            <label for="details-${addressCount}" class="form-label">detailes:</label>
            <input type="text" class="details-input form-control mb-2" name="details" required>
            <label for="postal-code-${addressCount}" class="form-label">postal code:</label>
            <input type="text" class="postal-code-input form-control">
            <button type="button" class="btn btn-danger mt-2 remove-address">remove address</button>
        `;
        addressesSection.appendChild(addressDiv);

        // remove address btn
        addressDiv.querySelector(".remove-address").addEventListener("click", () => {
            addressDiv.remove();
        });
    });

    // Checking password match
    repeatPasswordInput.addEventListener("input", () => {
        if (passwordInput.value !== repeatPasswordInput.value) {
            passwordError.style.display = "block";
        } else {
            passwordError.style.display = "none";
        }
    });

    // send form information
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (passwordInput.value !== repeatPasswordInput.value) {
            passwordError.style.display = "block";
            return;
        }

        const data = {
            username: form.username.value,
            password: form.password.value,
            first_name: form["first_name"].value,
            last_name: form["last_name"].value,
            email: form.email.value,
            phone_number: form["phone_number"].value,
            addresses: [],
        };

        const addressInputs = addressesSection.querySelectorAll(".address");
        addressInputs.forEach((addressDiv) => {
            const title = addressDiv.querySelector(".title-input").value;
            const address = addressDiv.querySelector(".address-input").value;
            const details = addressDiv.querySelector(".details-input").value;
            const postalCode = addressDiv.querySelector(".postal-code-input").value;
            data.addresses.push({
                title,
                address,
                details,
                postal_code: postalCode,
            });
        });

        try {
            const response = await fetch("/api/register-customer/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const responseData = await response.json();

            if (response.ok) {
                // save token in localStorage
                if (responseData.token) {
                    localStorage.setItem("token", responseData.token);
                }
                document.getElementById("response-message").innerText = "ثبت‌نام با موفقیت انجام شد!";
                document.getElementById("response-message").className = "text-success";

                // redirect to main restaurant page
                setTimeout(() => {
                    window.location.href = "/customer-dashboard/";

                }, 2000);
            } else {
                document.getElementById("response-message").innerText = `error: ${JSON.stringify(responseData)}`;
                document.getElementById("response-message").className = "text-danger";
            }
        } catch (error) {
            document.getElementById("response-message").innerText = `Error connecting to the server. Please try again..`;
            document.getElementById("response-message").className = "text-danger";
        }
    });

});
