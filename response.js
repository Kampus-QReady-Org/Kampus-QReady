// User type selection
const studentType = document.getElementById("studentType");
const staffType = document.getElementById("staffType");
const userNumberLabel = document.getElementById("userNumberLabel");
const userNumber = document.getElementById("userNumber");

if (studentType && staffType && userNumberLabel && userNumber) {
  // Student selected
  studentType.addEventListener("change", function () {
    userNumberLabel.textContent = "Student Number";
    userNumber.placeholder = "Enter student number";
    userNumber.setCustomValidity("");
  });

  // NWU Staff selected
  staffType.addEventListener("change", function () {
    userNumberLabel.textContent = "Staff Number";
    userNumber.placeholder = "Enter staff number";
    userNumber.setCustomValidity("");
  });

  // Validation message
  userNumber.addEventListener("invalid", function () {
    if (studentType.checked) {
      userNumber.setCustomValidity("Please enter your student number.");
    } else if (staffType.checked) {
      userNumber.setCustomValidity("Please enter your staff number.");
    } else {
      userNumber.setCustomValidity(
        "Please enter your student or staff number.",
      );
    }
  });

  // Clear error when user starts typing
  userNumber.addEventListener("input", function () {
    userNumber.setCustomValidity("");
  });
}

// Passworword confirmation validation
// Check if password and confirm password match
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");

if (password && confirmPassword) {
  confirmPassword.addEventListener("input", function () {
    if (password.value !== confirmPassword.value) {
      confirmPassword.setCustomValidity("Passwords do not match.");
    } else {
      confirmPassword.setCustomValidity("");
    }
  });
}
// Sidebar toggle for mobile view
const menuButton = document.getElementById("menuButton");
const sidebar = document.querySelector(".dashboard-sidebar");

menuButton.addEventListener("click", function () {
  sidebar.classList.toggle("mobile-open");
});

// =====================================================
// PATIENT DASHBOARD
// =====================================================

// -----------------------------------------------------
// 1. DISPLAY LOGGED-IN PATIENT INFORMATION
// -----------------------------------------------------

// This function will display information belonging to
// the patient who successfully logged into the system.
//
// The 'user' data will eventually come from the backend
// after the patient's login credentials are authenticated.

function displayPatientInfo(user) {
  // Patient name displayed in the top-right account area
  const userName = document.getElementById("userName");

  // Patient role displayed underneath the patient's name
  const userRole = document.getElementById("userRole");

  // Patient name displayed in "Welcome back, Name"
  const welcomeName = document.getElementById("welcomeName");

  // Display the patient's name in the account section
  if (userName) {
    userName.textContent = user.name;
  }

  // Display the patient's role
  if (userRole) {
    userRole.textContent = user.role;
  }

  // Display the patient's name in the welcome message
  if (welcomeName) {
    welcomeName.textContent = user.name;
  }
}

// -----------------------------------------------------
// 2. MOBILE SIDEBAR
// -----------------------------------------------------

// Gets the hamburger/menu button used on smaller screens
const menuButton = document.getElementById("menuButton");

// Gets the dashboard sidebar
const dashboardSidebar = document.querySelector(".dashboard-sidebar");

// Opens or closes the sidebar when the hamburger
// button is clicked on a mobile device.
if (menuButton && dashboardSidebar) {
  menuButton.addEventListener("click", function () {
    dashboardSidebar.classList.toggle("mobile-open");
  });
}

// -----------------------------------------------------
// BACKEND INTEGRATION NOTE
// -----------------------------------------------------

// Do NOT hard-code a patient's actual name here.
//
// After backend authentication is connected,
// the backend should provide the logged-in user's
// information.
//
// Example of the expected information:
//
// {
//   name: "Patient's name",
//   role: "Patient"
// }
//
// The frontend can then call:
//
// displayPatientInfo(user);
//
// This will automatically update:
// 1. The account name
// 2. The account role
// 3. The "Welcome back, Name" message
