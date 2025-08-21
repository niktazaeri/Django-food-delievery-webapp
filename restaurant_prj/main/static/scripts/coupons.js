document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please log in first.');
        window.location.href = '/login/';
        return;
    }

    const couponsSection = document.getElementById("couponsSection");
    const couponFormSection = document.getElementById("couponFormSection");
    const couponInfoSection = document.getElementById("couponInfoSection");

    const createCouponBtn = document.getElementById("createCouponBtn");
    const cancelCouponForm = document.getElementById("cancelCouponForm");
    const backToManageCoupons = document.getElementById("backToManageCoupons");
    const couponForm = document.getElementById("couponForm");

    const couponList = document.getElementById("couponList");
    let couponDetails = document.getElementById("couponDetails");

    let couponId = null; // ذخیره ID کوپن در حالت ویرایش

    // Show the Manage Coupon Section
    function showCouponSection() {
        couponsSection.style.display = "block";
        couponFormSection.style.display = "none";
        couponInfoSection.style.display = "none";
        setActiveTabInCookie("couponsSection");
    }

    // Show the Create/Edit Coupon Form
    function showCouponForm() {
        const formTitle = localStorage.getItem("formTitle");
        if (formTitle === "Edit Coupon") {
            document.getElementById("couponFormTitle").textContent = "Edit Coupon";
            if (couponId) {
                // Fetch and populate the form if editing
                fetch(`/api/edit-coupon/${couponId}/`)
                    .then(response => response.json())
                    .then(data => {
                        document.getElementById("coupon-code").value = data.code;
                        document.getElementById("discount").value = data.discount;
                        document.getElementById("expiration_date").value = data.expiration_date;
                    })
                    .catch(err => {
                        console.error("Error:", err);
                        alert("Failed to load coupon details.");
                    });
            }
        } else if (formTitle === "Create Coupon") {
            document.getElementById("couponFormTitle").textContent = "Create Coupon";
            couponForm.reset(); // Reset form fields for new coupon creation
        }
        couponsSection.style.display = "none";
        couponFormSection.style.display = "block";
        couponInfoSection.style.display = "none";
        setActiveTabInCookie("couponFormSection");
    }

    // Show the Info Section
    function showCouponInfo(data) {
        couponDetails.innerHTML = `
            <strong>Code:</strong> ${data.code}<br>
            <strong>Discount:</strong> ${data.discount}%<br>
            <strong>Expiration Date:</strong> ${data.expiration_date}<br>
        `;
        couponInfoSection.style.display = "block";
        couponsSection.style.display = "none";
        couponFormSection.style.display = "none";
        setActiveTabInCookie("couponInfoSection");
    }

    // Load Coupons List
    function loadCoupons() {
        fetch('/api/coupons/')
            .then(response => response.json())
            .then(data => {
                couponList.innerHTML = '';
                data.forEach(coupon => {
                    const couponItem = document.createElement("div");
                    couponItem.className = "list-group-item d-flex justify-content-between align-items-center";
                    couponItem.innerHTML = `
                        <span>${coupon.code} ${coupon.discount}% (${coupon.expiration_date})</span>
                        <div>
                            <button class="btn infobtn btn-sm me-2" onclick="viewCoupon(${coupon.id})">Info</button>
                            <button class="btn btn-warning btn-sm me-2" onclick="editCoupon(${coupon.id})">Edit</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteCoupon(${coupon.id})">Delete</button>
                        </div>
                    `;
                    couponList.appendChild(couponItem);
                });
            });
    }

    // Edit Coupon
    window.editCoupon = function (id) {
        couponId = id; // ذخیره ID کوپن برای ویرایش
        localStorage.setItem("formTitle", "Edit Coupon");
        showCouponForm(); // Call showCouponForm to load the coupon data
    };

    //Delete Coupon
    window.deleteCoupon = function (id) {
        if (confirm("Are you sure you want to delete this coupon?")) {
            fetch(`/api/delete-coupon/${id}/`, {
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
                    loadCoupons(); // Refresh the coupon list after deletion
                    alert("Coupon deleted successfully!");
                })
                .catch(err => {
                    console.error("Error:", err);
                    alert(`Error: ${err.message}`);
                });
        }
    };

    // View Coupon Info
    window.viewCoupon = function (id) {
        fetch(`/api/coupons/${id}/`)
            .then(response => response.json())
            .then(data => {
                // ذخیره اطلاعات در localStorage
                localStorage.setItem('activeCouponId', id);
                localStorage.setItem('couponDetails', JSON.stringify(data));
                showCouponInfo(data);
            })
            .catch(err => {
                console.error("Error:", err);
                alert("Failed to load coupon details.");
            });
    };

    // Handle Back to coupons list button
    backToManageCoupons.addEventListener("click", () => {
        couponInfoSection.style.display = "none";
        showCouponSection();
    });

    // Handle Create Button Click
    createCouponBtn.addEventListener("click", () => {
        couponId = null; // Reset the coupon ID for creating a new coupon
        localStorage.setItem("formTitle", "Create Coupon");
        showCouponForm(); // Show the create coupon form
    });

    // Handle Cancel Form
    cancelCouponForm.addEventListener("click", showCouponSection);

    // Submit Coupon Form
    couponForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const formData = {
            code: document.getElementById("coupon-code").value,
            discount: document.getElementById("discount").value,
            expiration_date: document.getElementById("expiration_date").value,
        };

        const url = couponId ? `/api/edit-coupon/${couponId}/` : '/api/add-coupon/';
        const method = couponId ? "PUT" : "POST";

        fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => {
                        throw new Error(JSON.stringify(err));
                    });
                }
                return response.json();
            })
            .then((data) => {
                console.log('Edited Coupon:', data); // بررسی داده‌های ویرایش شده
    showCouponSection();
    loadCoupons(); // بارگذاری مجدد کوپن‌ها
            })
            .catch(err => {
                console.error("Error:", err);
                alert(`Error: ${err.message}`);
            });
    });

    // Load coupons on page load
    loadCoupons();
});
