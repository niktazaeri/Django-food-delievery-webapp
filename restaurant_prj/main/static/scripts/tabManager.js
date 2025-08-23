// Store active tab ID in cookie
function setActiveTabInCookie(tabId) {
    document.cookie = `activeTab=${tabId};path=/;`;
}

// Read the active tab from a cookie
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

    // Add event listener to each link
    sidebarLinks.forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();

            // hide all sections
            contentSections.forEach(section => {
                section.style.display = "none";
            });

            // Get target (ID of the desired section)
            const targetId = this.getAttribute("data-target");
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.style.display = "block";
                setActiveTabInCookie(targetId); // save active tab in cookie
            }
        });
    });
}

// tabs management
function setupTabManagement(defaultTabId) {

    hideAllSections()

    // Retrieve the active tab from the cookie and display it
    const activeTabId = getActiveTabFromCookie();
    const activeSubTabId = getActiveSubTabFromCookie()


    if (activeTabId) {
        const activeSection = document.getElementById(activeTabId);
        if (activeSection) {
            activeSection.style.display = "block";
        }
    } else if (defaultTabId) {
        // Show specific tab by default
        const defaultSection = document.getElementById(defaultTabId);
        if (defaultSection) {
            defaultSection.style.display = "block";
        }
    }

}

console.log(getActiveTabFromCookie())

