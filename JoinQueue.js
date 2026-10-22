// =========================
// GLOBAL ELEMENTS & SETUP
// =========================
const joinQueueButton = document.getElementById("joinQueueButton");
const leaveQueueButton = document.getElementById("leaveQueueButton");
const ticketCard = document.getElementById("ticketCard");
const ticketNumber = document.getElementById("ticketNumber");
const myPosition = document.getElementById("myPosition");
const peopleAhead = document.getElementById("peopleAhead");
const queueStatus = document.getElementById("queueStatus");

const queueStatusText = document.getElementById("queueStatusText");
const queueLiveBadge = document.getElementById("queueLiveBadge");
const queueLiveDot = document.getElementById("queueLiveDot");

// =========================
// CENTRALIZED OPERATING HOURS (SAST)
// =========================
function isQueueOpenNow() {
  const parts = new Intl.DateTimeFormat("en-ZA", {
    timeZone: "Africa/Johannesburg",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const values = {};
  parts.forEach((part) => {
    values[part.type] = part.value;
  });

  const weekday = values.weekday;
  const hour = Number(values.hour);
  const minute = Number(values.minute);
  const currentMinutes = hour * 60 + minute;

  // Saturday and Sunday
  if (weekday === "Sat" || weekday === "Sun") {
    return false;
  }

  // Monday to Thursday: 08:30 - 16:15
  if (["Mon", "Tue", "Wed", "Thu"].includes(weekday)) {
    const openingTime = 8 * 60 + 30;
    const closingTime = 16 * 60 + 15;
    return currentMinutes >= openingTime && currentMinutes < closingTime;
  }

  // Friday: 08:30 - 13:00
  if (weekday === "Fri") {
    const openingTime = 8 * 60 + 30;
    const closingTime = 13 * 60;
    return currentMinutes >= openingTime && currentMinutes < closingTime;
  }

  return false;
}

function updateClinicStatus() {
  if (!queueStatusText || !queueLiveDot) {
    return;
  }

  const isOpen = isQueueOpenNow();

  if (isOpen) {
    queueStatusText.textContent = "Queue is currently open";
    queueLiveDot.style.backgroundColor = "#198754";

    if (queueLiveBadge) {
      queueLiveBadge.textContent = "Live";
      queueLiveBadge.style.backgroundColor = "#198754";
      queueLiveBadge.style.color = "#ffffff";
    }

    if (joinQueueButton && (!ticketCard || ticketCard.style.display === "none")) {
      joinQueueButton.disabled = false;
      joinQueueButton.innerHTML = '<i class="bi bi-plus-circle"></i> Join Queue';
    }
  } else {
    queueStatusText.textContent = "Queue is currently closed";
    queueLiveDot.style.backgroundColor = "#6c757d";

    if (queueLiveBadge) {
      queueLiveBadge.textContent = "Closed";
      queueLiveBadge.style.backgroundColor = "#6c757d";
      queueLiveBadge.style.color = "#ffffff";
    }

    if (joinQueueButton && (!ticketCard || ticketCard.style.display === "none")) {
      joinQueueButton.disabled = true;
      joinQueueButton.innerHTML = '<i class="bi bi-x-circle"></i> Queue Closed';
    }
  }
}

// Check status immediately and refresh every minute
updateClinicStatus();
setInterval(updateClinicStatus, 60000);


// =========================
// JOIN QUEUE
// =========================
if (joinQueueButton) {
  joinQueueButton.addEventListener("click", async function () {
    if (!isQueueOpenNow()) {
      alert("The queue is currently closed. Please join during operating hours.");
      updateClinicStatus();
      return;
    }

    console.log("JOIN QUEUE BUTTON CLICKED");
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE_URL}/api/queue/join`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to join the queue.");
      }

      const queue = data.queue;

      if (ticketNumber) ticketNumber.textContent = queue.ticket;
      if (myPosition) myPosition.textContent = queue.position;
      if (peopleAhead) peopleAhead.textContent = queue.peopleAhead;

      const visualTicket = document.getElementById("visualQueueTicket");
      const visualPosition = document.getElementById("visualQueuePosition");
      const visualPeopleAhead = document.getElementById("visualQueuePeopleAhead");

      if (visualTicket) visualTicket.textContent = queue.ticket ?? "—";
      if (visualPosition) visualPosition.textContent = queue.position ?? "—";
      if (visualPeopleAhead) visualPeopleAhead.textContent = queue.peopleAhead ?? "—";

      // Show ticket
      if (ticketCard) {
        ticketCard.style.display = "block";
        ticketCard.scrollIntoView({ behavior: "smooth" });
      }

      // Change button state
      joinQueueButton.innerHTML = '<i class="bi bi-check-circle"></i> Joined Queue';
      joinQueueButton.disabled = true;

      console.log("Successfully joined queue:", queue);
    } catch (error) {
      console.error("Error joining queue:", error);
      alert(error.message);
    }
  });
}


// =========================
// LEAVE QUEUE
// =========================
if (leaveQueueButton) {
  leaveQueueButton.addEventListener("click", async function () {
    const confirmLeave = confirm("Are you sure you want to leave the queue?");
    if (!confirmLeave) return;

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE_URL}/api/queue/leave`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to leave the queue.");
      }

      console.log("Successfully left queue:", data);

      if (ticketCard) ticketCard.style.display = "none";

      const visualTicket = document.getElementById("visualQueueTicket");
      const visualPosition = document.getElementById("visualQueuePosition");
      const visualPeopleAhead = document.getElementById("visualQueuePeopleAhead");

      if (visualTicket) visualTicket.textContent = "—";
      if (visualPosition) visualPosition.textContent = "—";
      if (visualPeopleAhead) visualPeopleAhead.textContent = "—";

      if (joinQueueButton) {
        joinQueueButton.innerHTML = '<i class="bi bi-plus-circle"></i> Join Queue';
        joinQueueButton.disabled = false;
      }
      updateClinicStatus();

    } catch (error) {
      console.error("Error leaving queue:", error);
      alert(error.message);
    }
  });
}


// =========================
// LOAD EXISTING QUEUE
// =========================
async function loadExistingQueue() {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const response = await fetch(`${API_BASE_URL}/api/queue/status`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) return;

    const data = await response.json();
    console.log("Current queue status:", data);
    const queue = data.queue;

    const visualTicket = document.getElementById("visualQueueTicket");
    const visualPosition = document.getElementById("visualQueuePosition");
    const visualPeopleAhead = document.getElementById("visualQueuePeopleAhead");

    if (!queue) {
      if (ticketCard) ticketCard.style.display = "none";
      if (visualTicket) visualTicket.textContent = "—";
      if (visualPosition) visualPosition.textContent = "—";
      if (visualPeopleAhead) visualPeopleAhead.textContent = "—";

      if (joinQueueButton) {
        joinQueueButton.innerHTML = '<i class="bi bi-plus-circle"></i> Join Queue';
      }
      updateClinicStatus();
      return;
    }

    // Display existing queue information
    if (ticketNumber) ticketNumber.textContent = queue.ticket;
    if (myPosition) myPosition.textContent = queue.position;
    if (peopleAhead) peopleAhead.textContent = queue.peopleAhead;

    if (visualTicket) visualTicket.textContent = queue.ticket ?? "—";
    if (visualPosition) visualPosition.textContent = queue.position ?? "—";
    if (visualPeopleAhead) visualPeopleAhead.textContent = queue.peopleAhead ?? "—";

        if (queueStatus) {
      queueStatus.textContent =
        (queue.status || "").toLowerCase() === "called" ? "Called" : "Waiting";
    }

    if (ticketCard) ticketCard.style.display = "block";

    if (joinQueueButton) {
      joinQueueButton.innerHTML = '<i class="bi bi-check-circle"></i> Joined Queue';
      joinQueueButton.disabled = true;
    }
  } catch (error) {
    console.error("Error loading existing queue:", error);
  }
}

loadExistingQueue();
setInterval(loadExistingQueue, 10000);


// =========================
// PATIENT DASHBOARD & USER INFO
// =========================
const loggedInUser = JSON.parse(localStorage.getItem("user"));

if (loggedInUser) {
  const userName = document.getElementById("userName");
  const userRole = document.getElementById("userRole");

  if (userName) {
    const firstName = loggedInUser.firstName || loggedInUser.name;
    const lastName = loggedInUser.lastName || loggedInUser.surname;
    userName.textContent = `${firstName} ${lastName}`;

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

  // Hide Appointments & Cards from guests
  const appointmentMenuItem = document.getElementById("appointmentMenuItem");
  const appointmentCard = document.getElementById("appointmentCard");
  const isGuest = !loggedInUser.studentNumber && !loggedInUser.staffNumber;

  if (isGuest) {
    if (appointmentMenuItem) appointmentMenuItem.style.display = "none";
    if (appointmentCard) appointmentCard.remove();
  }

  console.log("Logged in user:", loggedInUser);
}


// =========================
// MODAL RESET (Emergency Section)
// =========================
const contactModal = document.getElementById("contactModal");
const emergencyDetails = document.getElementById("emergencyDetails");

if (contactModal && emergencyDetails) {
  contactModal.addEventListener("show.bs.modal", function () {
    const emergencyCollapse = bootstrap.Collapse.getOrCreateInstance(
      emergencyDetails,
      { toggle: false }
    );
    emergencyCollapse.hide();
  });
}