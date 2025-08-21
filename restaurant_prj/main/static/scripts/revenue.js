document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please log in first.');
        window.location.href = '/login/';
        return;
    }

    const calculateButton = document.getElementById("calculateRevenue");
    const revenueResult = document.getElementById("revenueResult");

    calculateButton.addEventListener("click", function () {
        const startDate = document.getElementById("startDate").value;
        const endDate = document.getElementById("endDate").value;

        if (!startDate || !endDate) {
            revenueResult.textContent = "Please select both start and end dates.";
            revenueResult.classList.add("text-danger");
            return;
        }

        // Clear previous messages
        revenueResult.textContent = "";
        revenueResult.classList.remove("text-danger");

        // Make API request
        fetch(`/api/total-revenue/?start_date=${startDate}&end_date=${endDate}`)
            .then(response => {
                console.log("Response Status:", response.status); // چاپ وضعیت پاسخ
                console.log("Response Headers:", response.headers);
                if (response.ok) {
                    return response.json();
                } else {
                    return response.json().then(data => {
                        throw new Error(data.message || "Error fetching revenue data.");
                    });
                }
            })
            .then(data => {
                console.log("API Data:", data); // چاپ داده‌های API
                revenueResult.textContent = `${data.message} ${data.total_revenue} تومان`;
                revenueResult.classList.remove("text-danger");
                revenueResult.classList.add("text-success");
            })
            .catch(error => {
                revenueResult.textContent = error.message;
                revenueResult.classList.add("text-danger");
            });
    });
});
