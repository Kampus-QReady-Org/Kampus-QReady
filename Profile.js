
document.addEventListener("DOMContentLoaded", loadProfile);

async function loadProfile() {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "index.html";
        return;
    }

    try {
        const response = await fetch(
            "http://localhost:3000/api/auth/profile",
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Unable to load profile.");
        }

        console.log("Profile received:", result);

        const user = result.user;

// Hide Appointments from guests
const appointmentMenuItem =
    document.getElementById("appointmentMenuItem");

if (
    appointmentMenuItem &&
    !user.studentNumber &&
    !user.staffNumber
) {
    appointmentMenuItem.style.display = "none";
}


        // Build full name
        const fullName =
            `${user.firstName || ""} ${user.lastName || ""}`.trim();

        // =========================
        // PROFILE HEADER
        // =========================

        document.getElementById("userName").textContent =
            fullName || "User";

        document.getElementById("profileName").textContent =
            fullName || "User";


        // =========================
        // PERSONAL INFORMATION
        // =========================

        document.getElementById("fullName").textContent =
            fullName || "Not provided";

        document.getElementById("studentNumber").textContent =
            user.studentNumber || "Not provided";

        document.getElementById("email").textContent =
            user.email || "Not provided";

        document.getElementById("phone").textContent =
            user.phone || "Not provided";


        // =========================
        // ACCOUNT TYPE
        // =========================

        let accountType = "User";

        if (user.isStudent) {
            accountType = "Student";
        } else if (user.isStaff) {
            accountType = "Staff";
        } else if (user.isGuest) {
            accountType = "Guest";
        }

        document.getElementById("userRole").textContent =
            accountType;

        document.getElementById("accountType").textContent =
            accountType;

    } catch (error) {
        console.error("Profile loading error:", error);

        alert("Unable to load your profile. Please log in again.");

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "index.html";
    }
}