// Radio button navigation
document.getElementById("radioLogin").addEventListener("change", function () {
  if (this.checked) {
    window.location.href = "index.html";
  }
});

document
  .getElementById("radioRegister")
  .addEventListener("change", function () {
    if (this.checked) {
      window.location.href = "Registration page.html";
    }
  });

document.getElementById("radioGuest").addEventListener("change", function () {
  if (this.checked) {
    window.location.href = "Guest login page.html";
  }
});

// User type selection validation
const studentType = document.getElementById("studentType");
const staffType = document.getElementById("staffType");
const userNumberLabel = document.getElementById("userNumberLabel");
const userNumber = document.getElementById("userNumber");

if (studentType && staffType && userNumberLabel && userNumber) {
  studentType.addEventListener("change", function () {
    userNumberLabel.textContent = "Student Number";
    userNumber.placeholder = "Enter student number";
  });

  staffType.addEventListener("change", function () {
    userNumberLabel.textContent = "Staff Number";
    userNumber.placeholder = "Enter staff number";
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
