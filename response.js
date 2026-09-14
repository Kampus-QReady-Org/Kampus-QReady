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
