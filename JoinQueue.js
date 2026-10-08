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
joinQueueButton.addEventListener("click", async function () {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch("http://localhost:3000/api/queue/join", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to join the queue.");
    }

    const queue = data.queue;

    ticketNumber.textContent = queue.ticket;
    myPosition.textContent = queue.position;
    peopleAhead.textContent = queue.peopleAhead;

    // Show ticket
    ticketCard.style.display = "block";

    // Change button
    joinQueueButton.innerHTML =
      '<i class="bi bi-check-circle"></i> Joined Queue';

    joinQueueButton.disabled = true;

    // Scroll to ticket
    ticketCard.scrollIntoView({
      behavior: "smooth",
    });

    console.log("Successfully joined queue:", queue);

  } catch (error) {
    console.error("Error joining queue:", error);
    alert(error.message);
  }
});

// =========================
// LEAVE QUEUE
// =========================

leaveQueueButton.addEventListener("click", async function () {

  const confirmLeave = confirm("Are you sure you want to leave the queue?");

  if (!confirmLeave) {
    return;
  }

  const token = localStorage.getItem("token");

  try {

    const response = await fetch(
      "http://localhost:3000/api/queue/leave",
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Unable to leave the queue."
      );
    }

    console.log("Successfully left queue:", data);

    ticketCard.style.display = "none";

    joinQueueButton.innerHTML =
      '<i class="bi bi-plus-circle"></i> Join Queue';

    joinQueueButton.disabled = false;

  } catch (error) {

    console.error("Error leaving queue:", error);

    alert(error.message);
  }
});

// =========================
// LOAD EXISTING QUEUE
// =========================

async function loadExistingQueue() {

  const token = localStorage.getItem("token");

  if (!token) {
    return;
  }

  try {

    const response = await fetch(
      "http://localhost:3000/api/queue/status",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      return;
    }

    const data = await response.json();

    console.log("Current queue status:", data);

    const queue = data.queue;

    if (!queue) {
      return;
    }

    // Display existing queue information
    ticketNumber.textContent = queue.ticket;
    myPosition.textContent = queue.position;
    peopleAhead.textContent = queue.peopleAhead;

    // Show ticket
    ticketCard.style.display = "block";

    // Update Join Queue button
    joinQueueButton.innerHTML =
      '<i class="bi bi-check-circle"></i> Joined Queue';

    joinQueueButton.disabled = true;

  } catch (error) {

    console.error(
      "Error loading existing queue:",
      error
    );

  }
}

loadExistingQueue();

// =====================================================
// PATIENT DASHBOARD
// =====================================================

// ========================================
// DISPLAY LOGGED-IN USER
// ========================================

const loggedInUser = JSON.parse(localStorage.getItem("user"));

if (loggedInUser) {

    const userName = document.getElementById("userName");
    const userRole = document.getElementById("userRole");

    if (userName) {
    const firstName = loggedInUser.firstName || loggedInUser.name;
    const lastName = loggedInUser.lastName || loggedInUser.surname;

    userName.textContent =
        `${firstName} ${lastName}`;
}

    if (userRole) {
        if (loggedInUser.staffNumber) {
            userRole.textContent = "Staff";
        } else if (loggedInUser.studentNumber) {
            userRole.textContent = "Student";
        } else {
            userRole.textContent = "Guest";
        }
    }
}

// Hide Appointments from guests
const appointmentMenuItem =
  document.getElementById("appointmentMenuItem");

console.log("Logged in user:", loggedInUser);
console.log("Appointment menu:", appointmentMenuItem);

if (
  appointmentMenuItem &&
  loggedInUser &&
  !loggedInUser.studentNumber &&
  !loggedInUser.staffNumber
) {
  appointmentMenuItem.style.display = "none";
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
