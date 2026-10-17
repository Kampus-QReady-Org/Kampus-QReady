document.addEventListener("DOMContentLoaded", loadProfile);

async function loadProfile() {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "index.html";
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Unable to load profile.");
    }

    console.log("Profile received:", result);

    const user = result.user;
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");

     // Control Appointments visibility
const appointmentMenuItem = document.getElementById("appointmentMenuItem");

if (appointmentMenuItem) {
  const isStudent =
    user.isStudent === true ||
    savedUser.isStudent === true ||
    Boolean(user.studentNumber || savedUser.studentNumber);

  const isStaff =
    user.isStaff === true ||
    savedUser.isStaff === true ||
    Boolean(user.staffNumber || savedUser.staffNumber);

  const hasAccess = isStudent || isStaff;

  appointmentMenuItem.style.display = hasAccess ? "" : "none";
}

    
    // Build full name (supports students, staff and guests)
    const firstName =
      user.firstName ||
      savedUser.firstName ||
      user.name ||
      savedUser.name ||
      "";

    const lastName =
      user.lastName ||
      savedUser.lastName ||
      user.surname ||
      savedUser.surname ||
      "";

    const fullName = `${firstName} ${lastName}`.trim();

    document.getElementById("userName").textContent = fullName || "User";
    document.getElementById("profileName").textContent = fullName || "User";

    document.getElementById("fullName").textContent =
      fullName || "Not provided";


    // =========================
    // PROFILE HEADER
    // =========================

    document.getElementById("userName").textContent = fullName || "User";

    document.getElementById("profileName").textContent = fullName || "User";

    // =========================
    // PERSONAL INFORMATION
    // =========================

    document.getElementById("fullName").textContent =
      fullName || "Not provided";

    document.getElementById("studentNumber").textContent =
      user.studentNumber || savedUser.studentNumber || "Not provided";

    document.getElementById("email").textContent =
      user.email || savedUser.email || "Not provided";

    document.getElementById("phone").textContent = user.phone || "Not provided";

    // =========================
    // ACCOUNT TYPE
    // =========================

    
    // Determine account type
let accountType = "User";

if (user.isGuest === true || savedUser.isGuest === true) {
  accountType = "Guest";
} else if (user.isStudent === true || savedUser.isStudent === true) {
  accountType = "Student";
} else if (user.isStaff === true || savedUser.isStaff === true) {
  accountType = "Staff";
}

// Update all account labels
document.getElementById("userRole").textContent = accountType;
document.getElementById("profileRole").textContent = accountType;
document.getElementById("accountType").textContent = accountType;

} catch (error) {
    console.error("Profile loading error:", error);

    alert("Unable to load your profile. Please log in again.");

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "index.html";
  }
}

const menuButton = document.getElementById("menuButton");
const dashboardSidebar = document.querySelector(".dashboard-sidebar");

if (menuButton && dashboardSidebar) {
  menuButton.addEventListener("click", function () {
    dashboardSidebar.classList.toggle("mobile-open");
  });
}
