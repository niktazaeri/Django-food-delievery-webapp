// ذخیره شناسه تب فعال در کوکی
function setActiveTabInCookie(tabId) {
    document.cookie = `activeTab=${tabId};path=/;`;
}

// خواندن تب فعال از کوکی
function getActiveTabFromCookie() {
    const cookies = document.cookie.split("; ");
    const activeTabCookie = cookies.find(cookie => cookie.startsWith("activeTab="));
    return activeTabCookie ? activeTabCookie.split("=")[1] : null;
}


function getActiveSubTabFromCookie() {
    const cookies = document.cookie.split("; ");
    const activeTabCookie = cookies.find(cookie => cookie.startsWith("activeSubTab="));
    return activeTabCookie ? activeTabCookie.split("=")[1] : null;
}

function hideAllSections(){
     const sidebarLinks = document.querySelectorAll(".sidebar a");
    const contentSections = document.querySelectorAll(".content-section");

    // اضافه کردن event listener به هر لینک
    sidebarLinks.forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault(); // جلوگیری از رفرش شدن صفحه

            // مخفی کردن همه بخش‌ها
            contentSections.forEach(section => {
                section.style.display = "none";
            });

            // دریافت target (id بخش مورد نظر)
            const targetId = this.getAttribute("data-target");
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.style.display = "block";
                setActiveTabInCookie(targetId); // ذخیره تب فعال در کوکی
            }
        });
    });
}

// مدیریت تب‌ها
function setupTabManagement(defaultTabId) {

    hideAllSections()

    // بازیابی تب فعال از کوکی و نمایش آن
    const activeTabId = getActiveTabFromCookie();
    const activeSubTabId = getActiveSubTabFromCookie()


    if (activeTabId) {
        const activeSection = document.getElementById(activeTabId);
        if (activeSection) {
            activeSection.style.display = "block";
        }
    } else if (defaultTabId) {
        // به طور پیش‌فرض نمایش تب مشخص
        const defaultSection = document.getElementById(defaultTabId);
        if (defaultSection) {
            defaultSection.style.display = "block";
        }
    }

}

console.log(getActiveTabFromCookie())

