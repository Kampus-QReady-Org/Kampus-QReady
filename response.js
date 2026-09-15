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

// =====================================================
// DASHBOARD CALENDAR
// =====================================================

// Get the calendar elements from the HTML
const calendarMonth = document.getElementById("calendarMonth");
const calendarDays = document.getElementById("calendarDays");
const previousMonth = document.getElementById("previousMonth");
const nextMonth = document.getElementById("nextMonth");

// Only run the calendar code if the calendar exists on the page
if (calendarMonth && calendarDays && previousMonth && nextMonth) {
  // Start the calendar on the current month and year
  const today = new Date();

  let displayedMonth = today.getMonth();
  let displayedYear = today.getFullYear();

  // -----------------------------------------------------
  // TEMPORARY APPOINTMENT DATA
  // -----------------------------------------------------

  // Appointment dates will eventually come from the backend.
  // This temporary date can be used later when testing.
  const appointmentDates = ["2026-09-15"];

  // -----------------------------------------------------
  // DISPLAY CALENDAR
  // -----------------------------------------------------

  function displayCalendar() {
    // Remove dates from the previously displayed month
    calendarDays.innerHTML = "";

    // Display the month name and year in the calendar heading
    const monthName = new Date(displayedYear, displayedMonth).toLocaleString(
      "en",
      {
        month: "long",
      },
    );

    calendarMonth.textContent = `${monthName} ${displayedYear}`;

    // Find the first day of the selected month
    const firstDay = new Date(displayedYear, displayedMonth, 1);

    // Find the number of days in the selected month
    const daysInMonth = new Date(
      displayedYear,
      displayedMonth + 1,
      0,
    ).getDate();

    // JavaScript uses:
    // Sunday = 0
    // Monday = 1
    // ...
    // Saturday = 6
    //
    // Our calendar starts on Monday,
    // so this converts the value to:
    // Monday = 0
    // ...
    // Sunday = 6
    const startingDay = (firstDay.getDay() + 6) % 7;

    // Add empty spaces before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      const emptySpace = document.createElement("span");

      calendarDays.appendChild(emptySpace);
    }

    // Create each date in the selected month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateElement = document.createElement("span");

      dateElement.textContent = day;

      // Create the date in YYYY-MM-DD format
      // so that it can be compared with appointment dates.
      const monthNumber = String(displayedMonth + 1).padStart(2, "0");

      const dayNumber = String(day).padStart(2, "0");

      const dateString = `${displayedYear}-${monthNumber}-${dayNumber}`;

      // Highlight the date if the patient has an appointment
      if (appointmentDates.includes(dateString)) {
        dateElement.classList.add("appointment-day");
      }

      // Add the date to the calendar
      calendarDays.appendChild(dateElement);
    }
  }

  // -----------------------------------------------------
  // PREVIOUS MONTH BUTTON
  // -----------------------------------------------------

  previousMonth.addEventListener("click", function () {
    displayedMonth--;

    // If we move backwards from January,
    // move to December of the previous year.
    if (displayedMonth < 0) {
      displayedMonth = 11;
      displayedYear--;
    }

    displayCalendar();
  });

  // -----------------------------------------------------
  // NEXT MONTH BUTTON
  // -----------------------------------------------------

  nextMonth.addEventListener("click", function () {
    displayedMonth++;

    // If we move forward from December,
    // move to January of the next year.
    if (displayedMonth > 11) {
      displayedMonth = 0;
      displayedYear++;
    }

    displayCalendar();
  });

  // Display the calendar when the dashboard first loads
  displayCalendar();
}
