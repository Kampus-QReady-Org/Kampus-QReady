const joinQueueButton = document.getElementById("joinQueueButton");

const leaveQueueButton = document.getElementById("leaveQueueButton");

const ticketCard = document.getElementById("ticketCard");

const ticketNumber = document.getElementById("ticketNumber");

const myPosition = document.getElementById("myPosition");

const peopleAhead = document.getElementById("peopleAhead");

const myWaitTime = document.getElementById("myWaitTime");

// =========================
// JOIN QUEUE
// =========================

joinQueueButton.addEventListener("click", function () {
  // Temporary ticket number
  // This will eventually come from the backend/database.

  ticketNumber.textContent = "Q024";

  myPosition.textContent = "7";

  peopleAhead.textContent = "6";

  myWaitTime.textContent = "35 min";

  // Show ticket

  ticketCard.style.display = "block";

  // Change button

  joinQueueButton.innerHTML = '<i class="bi bi-check-circle"></i> Joined Queue';

  joinQueueButton.disabled = true;

  // Scroll to ticket

  ticketCard.scrollIntoView({
    behavior: "smooth",
  });
});

// =========================
// LEAVE QUEUE
// =========================

leaveQueueButton.addEventListener("click", function () {
  const confirmLeave = confirm("Are you sure you want to leave the queue?");

  if (confirmLeave) {
    ticketCard.style.display = "none";

    joinQueueButton.innerHTML = '<i class="bi bi-plus-circle"></i> Join Queue';

    joinQueueButton.disabled = false;
  }
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

