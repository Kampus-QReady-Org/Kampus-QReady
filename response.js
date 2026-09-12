// Link Login/Register/Guest radio buttons to their respective pages

// Login
document.getElementById("radioLogin").addEventListener("change", function () {
  if (this.checked) {
    window.location.href = "index.html";
  }
});

// Register
document
  .getElementById("radioRegister")
  .addEventListener("change", function () {
    if (this.checked) {
      window.location.href = "Registration page.html";
    }
  });

// Guest
document.getElementById("radioGuest").addEventListener("change", function () {
  if (this.checked) {
    window.location.href = "Guest login page.html";
  }
});
