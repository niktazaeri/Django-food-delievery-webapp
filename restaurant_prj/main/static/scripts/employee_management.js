document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login to your account first.');
        window.location.href = '/login/';
        return;
    }

    const manageEmployeeSection = document.getElementById("manageEmployeeSection");
    const employeeFormSection = document.getElementById("employeeFormSection");
    const employeeInfoSection = document.getElementById("employeeInfoSection");

    const createEmployeeBtn = document.getElementById("createEmployeeBtn");
    const cancelEmployeeForm = document.getElementById("cancelEmployeeForm");
    const backToManageEmployees = document.getElementById("backToManageEmployees");
    const employeeForm = document.getElementById("employeeForm");

    const employeeList = document.getElementById("employeeList");
    const employeeDetails = document.getElementById("employeeDetails");

    let employeeId = null; // Save employee ID in edit mode

    // Show the Manage Employee Section
    function showManageEmployeeSection() {
        manageEmployeeSection.style.display = "block";
        employeeFormSection.style.display = "none";
        employeeInfoSection.style.display = "none";
        setActiveTabInCookie("manageEmployeeSection")
    }

    // Show the Create/Edit Employee Form
    function showEmployeeForm(title) {
        document.getElementById("employeeFormTitle").textContent = title;
        manageEmployeeSection.style.display = "none";
        employeeFormSection.style.display = "block";
        employeeInfoSection.style.display = "none";
        setActiveTabInCookie("employeeFormSection")
    }

    // Show the Info Section
    function showEmployeeInfo(data) {
        // show employee datas
        document.getElementById("employeeDetails").innerHTML = `
                <strong>Username:</strong> ${data.username}<br>
                <strong>First Name:</strong> ${data.first_name}<br>
                <strong>Last Name:</strong> ${data.last_name}<br>
                <strong>Email:</strong> ${data.email}<br>
                <strong>Phone Number:</strong> ${data.phone_number}<br>
            `;
        // show employee's datas section
        employeeInfoSection.style.display = "block";
        manageEmployeeSection.style.display = "none";
        employeeFormSection.style.display = "none";
        setActiveTabInCookie("employeeInfoSection")

    }

    // Load Employee List
    function loadEmployees() {
        fetch('/api/employees/')
            .then(response => response.json())
            .then(data => {
                employeeList.innerHTML = '';
                data.forEach(employee => {
                    const employeeItem = document.createElement("div");
                    employeeItem.className = "list-group-item d-flex justify-content-between align-items-center";
                    employeeItem.innerHTML = `
                        <span>${employee.first_name} ${employee.last_name} (${employee.username})</span>
                        <div>
                            <button class="btn infobtn me-2" onclick="viewEmployee(${employee.id})">Info</button>
                            <button class="btn btn-warning btn-sm me-2" onclick="editEmployee(${employee.id})">Edit</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteEmployee(${employee.id})">Delete</button>
                        </div>
                    `;
                    employeeList.appendChild(employeeItem);
                });
            });
    }

    // Edit Employee
    window.editEmployee = function (id) {
        fetch(`/api/edit-employee/${id}/`)
            .then(response => {
                if (!response.ok) throw new Error("Failed to load employee details");
                return response.json();
            })
            .then(data => {
                employeeId = id; // Save employee ID for edit
                document.getElementById("username").value = data.username;
                document.getElementById("password").value = data.password;
                document.getElementById("firstName").value = data.first_name;
                document.getElementById("lastName").value = data.last_name;
                document.getElementById("email").value = data.email;
                document.getElementById("phoneNumber").value = data.phone_number;
                showEmployeeForm("Edit Employee");
            })
            .catch(err => {
                console.error("Error:", err);
                alert("Failed to load employee details.");
            });
    };

    //Delete Employee
    window.deleteEmployee = function (id) {
        // Fetch employee details to get first and last name
        fetch(`/api/employees/${id}/`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to load employee details");
                }
                return response.json();
            })
            .then(data => {
                const fullName = `${data.first_name} ${data.last_name}`;
                const confirmMessage = `Are you sure you want to delete ${fullName}?`;

                // Show confirmation dialog with employee name
                if (confirm(confirmMessage)) {
                    // If confirmed, delete the employee
                    fetch(`/api/delete-employee/${id}/`, {
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
                            loadEmployees(); // Refresh the employee list after deletion
                            alert("Employee deleted successfully!");
                        })
                        .catch(err => {
                            console.error("Error:", err);
                            alert(`Error: ${err.message}`);
                        });
                }
            })
            .catch(err => {
                console.error("Error:", err);
                alert("Failed to load employee details.");
            });
    };


    // View Employee Info
    window.viewEmployee = function (id) {
        fetch(`/api/employees/${id}/`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to load employee details");
                }
                return response.json();
            })
            .then(data => {

                // Save employee ID and information in localStorage
                localStorage.setItem('activeEmployeeId', id); // Save employee ID
                localStorage.setItem('employeeDetails', JSON.stringify(data)); // save employee datas

                // show employee infos
                showEmployeeInfo(data);
            })
            .catch(err => {
                console.error("Error:", err);
                alert("Failed to load employee details.");
            });

    };

    //Handle Back to coupons list btn
    backToManageEmployees.addEventListener("click", () => {
        employeeInfoSection.style.display = "none";
        showManageEmployeeSection();
    });

    // Handle Create Button Click
    createEmployeeBtn.addEventListener("click", () => {
        employeeForm.reset();
        showEmployeeForm("Create Employee");
        setActiveTabInCookie("employeeFormSection")

    });

    // Handle Cancel Form
    cancelEmployeeForm.addEventListener("click", showManageEmployeeSection);

    // Submit Employee Form
    employeeForm.addEventListener("submit", (e) => {
        e.preventDefault();
        // Get password values and repeated one
        const password = document.getElementById("password").value;
        const repeatPassword = document.getElementById("password-repeat").value;

        // check password confirmation
        if (password !== repeatPassword) {
            const errorMsg = document.getElementById("passwordError");
            errorMsg.textContent = "Passwords do not match!";
            errorMsg.style.color = "red";
            console.log("Passwords do not match");
            return;
        }

        const formData = {
            username: document.getElementById("username").value,
            password: password,
            repeatPassword: repeatPassword,
            first_name: document.getElementById("firstName").value,
            last_name: document.getElementById("lastName").value,
            email: document.getElementById("email").value,
            phone_number: document.getElementById("phoneNumber").value,
        };

        const url = employeeId ? `/api/edit-employee/${employeeId}/` : '/api/register-employee/';
        const method = employeeId ? "PUT" : "POST";

        fetch(url, {
            method: method,
            headers: {
                'Authorization': `Token ${token}`,
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
            .then(() => {
                showManageEmployeeSection();
                loadEmployees();
            })
            .catch(err => {
                console.error("Error:", err);
                alert(`Error: ${err.message}`);
            });

    });

    // Check and Load Employee Info from Local Storage on Page Load
    const activeCouponId = localStorage.getItem('activeEmployeeId');
    const employeeDetailsStored = localStorage.getItem('employeeDetails');

    if (activeCouponId && employeeDetailsStored && getActiveTabFromCookie() === "employeeInfoSection") {
        const data = JSON.parse(employeeDetailsStored);
        showEmployeeInfo(data); // show saved datas from Local Storage
    }
    // Load employees on page load
    loadEmployees();
});
