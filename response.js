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

function displayPatientInfo(user) {
  const userName = document.getElementById("userName");
  const userRole = document.getElementById("userRole");
  const welcomeName = document.getElementById("welcomeName");

  // Registered student/staff
  const firstName = user.firstName || user.name || "";
  const lastName = user.lastName || user.surname || "";

  // Display full name in the profile area
  if (userName) {
    if (firstName && lastName) {
      userName.textContent = `${firstName} ${lastName}`;
    } else if (firstName) {
      userName.textContent = firstName;
    } else {
      userName.textContent = "Guest";
    }
  }

  // Display role
  if (userRole) {
    if (user.staffNumber) {
      userRole.textContent = "Staff";
    } else if (user.studentNumber) {
      userRole.textContent = "Student";
    } else {
      userRole.textContent = "Guest";
    }
  }

  // Display first name in "Welcome back, ..."
  if (welcomeName) {
    welcomeName.textContent = firstName || "Guest";
  }
}
const loggedInUser = JSON.parse(localStorage.getItem("user"));

if (loggedInUser) {
  displayPatientInfo(loggedInUser);
}


const appointmentMenuItem =
  document.getElementById("appointmentMenuItem");

const appointmentCard =
  document.querySelector(".appointment-card");

const isGuest =
  loggedInUser &&
  !loggedInUser.studentNumber &&
  !loggedInUser.staffNumber;

if (isGuest) {
  if (appointmentMenuItem) {
    appointmentMenuItem.style.display = "none";
  }

  if (appointmentCard) {
    appointmentCard.remove();
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

      const monthNumber = String(displayedMonth + 1).padStart(2, "0");
      const dayNumber = String(day).padStart(2, "0");
      const dateString = `${displayedYear}-${monthNumber}-${dayNumber}`;

      // Highlight today's date
      if (
        displayedYear === today.getFullYear() &&
        displayedMonth === today.getMonth() &&
        day === today.getDate()
      ) {
        dateElement.classList.add("today");
      }

      // Highlight appointment dates
      if (appointmentDates.includes(dateString)) {
        dateElement.classList.add("appointment-day");
      }

      //add each date to the calendar
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

// =====================================================
// RESET EMERGENCY SECTION WHEN CONTACT MODAL OPENS
// =====================================================

// Get the Contact & Location modal
const contactModal = document.getElementById("contactModal");

// Get the Emergency Assistance collapsible section
const emergencyDetails = document.getElementById("emergencyDetails");

// Only run if both elements exist
if (contactModal && emergencyDetails) {
  // Runs every time the Contact & Location modal opens
  contactModal.addEventListener("show.bs.modal", function () {
    // Get the Bootstrap collapse instance
    const emergencyCollapse = bootstrap.Collapse.getOrCreateInstance(
      emergencyDetails,
      {
        toggle: false,
      },
    );

    // Make sure Emergency Assistance starts collapsed
    emergencyCollapse.hide();
  });
}

// =====================================================
// LOGIN
// =====================================================

const loginForm = document.querySelector(".login-form");

if (loginForm) {
  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("studentNumber").value.trim();
    const passwordValue = document.getElementById("password").value;

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: passwordValue,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Login failed.");
        return;
      }

      // Save the login information
      localStorage.setItem("token", result.data.token);
      localStorage.setItem("user", JSON.stringify(result.data.user));

      // Staff member → Staff Dashboard
      if (result.data.user.staffNumber) {
        window.location.href = "staff-dashboard.html";
      } else {
        // Student → Student Dashboard
        window.location.href = "StudentDashboard.html";
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Unable to connect to the server.");
    }
  });
}
// =====================================================
// GUEST LOGIN
// =====================================================

const guestLoginForm = document.querySelector(".login-form");

if (
  guestLoginForm &&
  document.getElementById("guestName") &&
  document.getElementById("guestSurname") &&
  document.getElementById("guestId")
) {
  guestLoginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("guestName").value.trim();
    const surname = document.getElementById("guestSurname").value.trim();
    const idNumber = document.getElementById("guestId").value.trim();

    if (!name || !surname || !idNumber) {
      alert("Please enter your name, surname, and ID number.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/guest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          surname: surname,
          idNumber: idNumber,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Guest login failed.");
        return;
      }

      // Save guest login information
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));

      // Go to the guest/student queue page
      window.location.href = "StudentDashboard.html";
    } catch (error) {
      console.error("Guest login error:", error);

      alert("Unable to connect to the server.");
    }
  });
}
// =====================================================
// REGISTRATION
// =====================================================

const registrationForm = document.getElementById("registrationForm");

if (registrationForm) {
  registrationForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const firstName = document.getElementById("name").value.trim();
    const lastName = document.getElementById("surname").value.trim();
    const phone = document.getElementById("phoneNumber").value.trim();
    const email = document.getElementById("email").value.trim();
    const studentOrStaffNumber = document
      .getElementById("userNumber")
      .value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    const studentSelected = document.getElementById("studentType").checked;

    const staffSelected = document.getElementById("staffType").checked;

    // Check that passwords match
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: firstName,
          lastName: lastName,
          phone: phone,
          email: email,
          isStudent: studentSelected,
          isStaff: staffSelected,
          studentOrStaffNumber: studentOrStaffNumber,
          password: password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Registration failed.");
        return;
      }

      alert("Registration successful! You can now log in.");

      window.location.href = "index.html";
    } catch (error) {
      console.error("Registration error:", error);
      alert("Unable to connect to the server.");
    }
  });
}

// =========================
// STUDENT DASHBOARD QUEUE
// =========================

async function loadDashboardQueue() {
  const token = localStorage.getItem("token");

  if (!token) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/queue/status`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 404) {
      const ticket = document.getElementById("dashboardTicket");
      const position = document.getElementById("dashboardPosition");
      const peopleAhead = document.getElementById("dashboardPeopleAhead");
      const status = document.getElementById("dashboardQueueStatus");

      if (ticket) ticket.textContent = "—";
      if (position) position.textContent = "—";
      if (peopleAhead) peopleAhead.textContent = "—";
      if (status) status.textContent = "Not in queue";

      return;
    }

    if (!response.ok) {
      return;
    }

    const data = await response.json();
    const queue = data.queue;

    const ticket = document.getElementById("dashboardTicket");
    const position = document.getElementById("dashboardPosition");
    const peopleAhead = document.getElementById("dashboardPeopleAhead");
    const status = document.getElementById("dashboardQueueStatus");

    if (!queue) {
      if (ticket) ticket.textContent = "—";
      if (position) position.textContent = "—";
      if (peopleAhead) peopleAhead.textContent = "—";
      if (status) status.textContent = "Not in queue";
      return;
    }

    if (ticket) ticket.textContent = queue.ticket ?? "—";
    if (position) position.textContent = queue.position ?? "—";
    if (peopleAhead) peopleAhead.textContent = queue.peopleAhead ?? "—";
    if (status) status.textContent = "Waiting";
  } catch (error) {
    console.error("Error loading dashboard queue:", error);
  }
}

loadDashboardQueue();
setInterval(loadDashboardQueue, 10000);

// =========================
// STUDENT DASHBOARD APPOINTMENT
// =========================

let dashboardAppointments = [];

function getLocalAppointmentDate(dateValue) {
  const dateString = String(dateValue).slice(0, 10);
  const [year, month, day] = dateString.split("-").map(Number);

  // Convert the appointment date to a local JavaScript Date.
  return new Date(year, month - 1, day);
}

async function loadDashboardAppointment() {
  const token = localStorage.getItem("token");

  if (!token) {
    return;
  }

  const container = document.getElementById("upcomingAppointments");

  if (!container) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/appointments/my`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error("Unable to load appointments:", response.status);
      return;
    }

    const data = await response.json();

    console.log("Student appointments:", data.appointments);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    dashboardAppointments = (data.appointments || [])
      .filter((item) => {
        return (
          item.status === "scheduled" &&
          getLocalAppointmentDate(item.date) >= today
        );
      })
      .sort((a, b) => {
        return (
          getLocalAppointmentDate(a.date) - getLocalAppointmentDate(b.date)
        );
      })
      .slice(0, 2);

    if (dashboardAppointments.length === 0) {
      container.innerHTML = `
        <div class="appointment-item">
          <div class="appointment-content">

            <div class="appointment-date">
              <strong>—</strong>
              <span>—</span>
              <small>—</small>
            </div>

            <div class="appointment-details">
              <h4>No upcoming appointment</h4>

              <p>
                <i class="bi bi-clock"></i>
                <span>—</span>
              </p>

              <p>
                <i class="bi bi-geo-alt"></i>
                NWU Healthcare Centre
              </p>
            </div>

          </div>
        </div>
      `;

      return;
    }

    container.innerHTML = "";

    dashboardAppointments.forEach((appointment, index) => {
      const appointmentDate = getLocalAppointmentDate(appointment.date);

      const day = appointmentDate.getDate();

      const month = appointmentDate
        .toLocaleString("en-ZA", {
          month: "short",
        })
        .toUpperCase();

      const year = appointmentDate.getFullYear();

      const appointmentHTML = `
        <div class="appointment-item">

          <div class="appointment-content">

            <div class="appointment-date">
              <strong>${day}</strong>
              <span>${month}</span>
              <small>${year}</small>
            </div>

            <div class="appointment-details">
              <h4>General Consultation</h4>

              <p>
                <i class="bi bi-clock"></i>
                <span>${appointment.time}</span>
              </p>

              <p>
                <i class="bi bi-geo-alt"></i>
                NWU Healthcare Centre
              </p>
            </div>

          </div>

          <div class="appointment-buttons">

            <button
              class="primary-button view-appointment-button"
              data-index="${index}"
            >
              View Details
            </button>

            <button
              class="secondary-button cancel-appointment-button"
              data-index="${index}"
            >
              Cancel
            </button>

          </div>

        </div>
      `;

      container.insertAdjacentHTML("beforeend", appointmentHTML);
    });
  } catch (error) {
    console.error("Error loading dashboard appointment:", error);
  }
}

document
  .getElementById("upcomingAppointments")
  ?.addEventListener("click", async function (event) {
    const viewButton = event.target.closest(".view-appointment-button");

    if (viewButton) {
      const index = Number(viewButton.dataset.index);
      const appointment = dashboardAppointments[index];

      if (!appointment) {
        return;
      }

      const appointmentDate = getLocalAppointmentDate(appointment.date);

      alert(
        `Appointment Details\n\n` +
        `Type: General Consultation\n` +
        `Date: ${appointmentDate.toLocaleDateString("en-ZA")}\n` +
        `Time: ${appointment.time}\n` +
        `Status: ${appointment.status}`,
      );

      return;
    }

    const cancelButton = event.target.closest(".cancel-appointment-button");

    if (cancelButton) {
      const index = Number(cancelButton.dataset.index);
      const appointment = dashboardAppointments[index];

      if (!appointment) {
        return;
      }

      const confirmed = confirm(
        "Are you sure you want to cancel this appointment?",
      );

      if (!confirmed) {
        return;
      }

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please log in again.");
        return;
      }

      const visitId =
        appointment.visitId ?? appointment.Visit_ID ?? appointment.visit_id;

      if (!visitId) {
        console.error("Appointment data:", appointment);
        alert("Unable to identify this appointment.");
        return;
      }

      try {
        cancelButton.disabled = true;

        const response = await fetch(
          `${API_BASE_URL}/api/appointments/${visitId}/cancel`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Unable to cancel appointment.");
        }

        alert(result.message || "Appointment cancelled successfully.");

        await loadDashboardAppointment();
      } catch (error) {
        console.error("Cancellation error:", error);

        alert(error.message || "Something went wrong.");

        cancelButton.disabled = false;
      }
    }
  });

loadDashboardAppointment();

// FORGOT PASSWORD

const forgotPasswordLink = document.getElementById("forgotPasswordLink");

if (forgotPasswordLink) {
  forgotPasswordLink.addEventListener("click", function (event) {
    event.preventDefault();

    alert(
      "Please contact the administrator for assistance with resetting your password.",
    );
  });
}
